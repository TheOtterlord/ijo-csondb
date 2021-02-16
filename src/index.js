const CSONDatabase = require("./database/database");

/**
 * Loads the plugin
 * @param {Core} core IJO's core
 */
function load(core) {
    core.databaseTypes.register("cson", CSONDatabase);
}

module.exports = {
    load
};
