const express = require('express');
const fs = require('fs');
const path = require('path');
const set = require('./settings');
const chalk = require('chalk');

const app = express();
const PORT = process.env.PORT || 4000;

// Logger setup
const logger = {
    info: (message) => console.log(chalk.dim.blue('•') + chalk.dim(' info  - ') + message),
    ready: (message) => console.log(chalk.dim.green('•') + chalk.dim(' ready - ') + message),
    warn: (message) => console.log(chalk.dim.yellow('•') + chalk.dim(' warn  - ') + message),
    error: (message) => console.log(chalk.dim.red('•') + chalk.dim(' error - ') + message),
    event: (message) => console.log(chalk.dim.cyan('•') + chalk.dim(' event - ') + message)
};

app.set('trust proxy', true);
app.set('json spaces', 2);

// Middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', express.static(path.join(__dirname, 'docs')));

// Custom response format middleware
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const statusCode = res.statusCode || 200;
            const responseData = {
                status: data.status,
                statusCode: statusCode,
                creator: set.author.toLowerCase(),
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// Capitalize string prototype
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

logger.info('Loading scraper module...');
(async () => {
  global.scraper = new (await require('./lib/scrape.js'))('./lib/scrape_file');
  global.scrape = await scraper.list();

  setInterval(async () => {
    try {
      await scraper.load();
    } catch (error) {
      logger.error(`Failed to reload scraper: ${error.message}`);
    }
  }, 2000);
})();

// Function to load endpoints from directory
function loadEndpointsFromDirectory(directory, baseRoute = '') {
    let endpoints = [];
    const fullPath = path.join(__dirname, directory);
    
    if (!fs.existsSync(fullPath)) {
        logger.warn(`Directory not found: ${fullPath}`);
        return endpoints;
    }

    logger.info(`Scanning directory: ${directory}...`);
    const items = fs.readdirSync(fullPath);

    items.forEach(item => {
        const itemPath = path.join(fullPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            logger.info(`Found subdirectory: ${item}`);
            const nestedEndpoints = loadEndpointsFromDirectory(
                path.join(directory, item), 
                `${baseRoute}/${item}`
            );
            endpoints = [...endpoints, ...nestedEndpoints];
        } else if (stats.isFile() && item.endsWith('.js')) {
            try {
                const module = require(itemPath);

                if (module && module.run && typeof module.run === 'function') {
                    const endpointName = item.replace('.js', '');
                    const endpointPath = `${baseRoute}/${endpointName}`;

                    app.all(endpointPath, module.run);
                    let fullPathWithParams = endpointPath;
                    if (module.params && module.params.length > 0) {
                        fullPathWithParams += '?' + module.params.map(param => `${param}=`).join('&');
                    }

                    const category = module.category || 'Other';
                    const categoryIndex = endpoints.findIndex(endpoint => endpoint.name === category);

                    if (categoryIndex === -1) {
                        endpoints.push({
                            name: category,
                            items: []
                        });
                    }

                    const categoryObj = endpoints.find(endpoint => endpoint.name === category);
                    const endpointObj = {};
                    endpointObj[module.name || endpointName] = {
                        desc: module.desc || 'No description provided',
                        path: fullPathWithParams
                    };

                    categoryObj.items.push(endpointObj);
                    logger.ready(`${chalk.green(endpointPath)} ${chalk.dim('(')}${chalk.cyan(category)}${chalk.dim(')')}`);
                }
            } catch (error) {
                logger.error(`Failed to load module ${itemPath}: ${error.message}`);
            }
        }
    });

    return endpoints;
}

const { logRequest, getStats, setTotalEndpoints } = require('./lib/database/statistic');

app.use((req, res, next) => {
    logRequest(req.path);
    next();
});

app.get('/stats', (req, res) => {
    res.json(getStats());
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

logger.info('Loading API endpoints...');
const allEndpoints = loadEndpointsFromDirectory('api');
logger.ready(`Loaded ${allEndpoints.reduce((total, category) => total + category.items.length, 0)} endpoints`);

app.get('/endpoints', (req, res) => {
    const totalEndpoints = allEndpoints.reduce((total, category) => total + category.items.length, 0);
    setTotalEndpoints(totalEndpoints);
    res.json({
        status: true,
        count: totalEndpoints,
        endpoints: allEndpoints
    });
});

app.get('/set', (req, res) => {
    res.json({
        status: true,
        ...set
    });
});

const tempFolder = path.join(__dirname, 'tempp');

// Pastikan folder dan file ada
if (!fs.existsSync(tempFolder)) {
    console.error(`Folder ${tempFolder} tidak ditemukan.`);
} else {
    // Static file server untuk folder yang sudah disiapkan
    app.use("/cdn/downloads", express.static(tempFolder));
}

setInterval(() => {
    const files = fs.readdirSync(tempFolder);
    const now = Date.now();
    for (const file of files) {
        const filePath = path.join(tempFolder, file);
        const stats = fs.statSync(filePath);
        const ageInMs = now - stats.mtimeMs;
        if (ageInMs > 1000 * 60 * 60) { // Hapus file lebih tua dari 1 jam
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Gagal menghapus file: ${filePath}`, err);
            }
        }
    }
}, 1000 * 60 * 30); // Setiap 30 menit

app.use((req, res, next) => {
    logger.info(`404: ${req.method} ${req.path}`);
    res.status(404).sendFile(process.cwd() + '/docs/err/404.html');
});

app.use((err, req, res, next) => {
    logger.error(`500: ${err.message}`);
    res.status(500).sendFile(process.cwd() + '/docs/err/500.html');
});

// Serverless export
module.exports = app;
