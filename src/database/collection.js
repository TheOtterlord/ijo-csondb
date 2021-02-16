const path = require("path");
const root = path.join(path.dirname(require.main.filename), "../");

const Collection = require(path.join(root, "/src/database/collection"));
const CSONFile = require("../csonfile");

class CSONCollection extends Collection {
    constructor(name, modelClass, path) {
        super(name, modelClass);

        this.name = name;
        this.path = path;

        const defaults = {};
        defaults[this.name] = [];
        this.cson = new CSONFile(this.path, { defaults });
    }

    get data() {
        if (!this.cson.loaded) return [];

        return this.cson.get(this.name);
    }

    load() {
        return this.cson.load();
    }

    matchQuery(item, query) {
        for (const key of Object.keys(query)) {
            if (query[key] !== item[key]) return false;
        }

        return true;
    }

    async find(query) {
        super.find(query);

        if (!this.cson.loaded) await this.cson.load();

        return this.data.filter(item => this.matchQuery(item, query)).map(item => new (this.modelClass)(item));
    }

    async findOne(query) {
        super.findOne(query);

        return (await this.find(query))[0];
    }

    async add(items) {
        super.add(items);

        if (!this.cson.loaded) await this.cson.load();

        for (const item of items) {
            this.data.push(item.toObject());
        }
    }

    addOne(item) {
        super.addOne(item);

        return this.add([item]);
    }

    async remove(query, { replace } = {}) {
        super.remove(query);

        if (!this.cson.loaded) await this.cson.load();

        for (let item of this.data) {
            if (!this.matchQuery(item, query)) continue;

            this.data.splice(this.data.indexOf(item), 1, replace);
        }
    }

    async removeOne(query, { replace } = {}) {
        super.removeOne(query);

        if (!this.cson.loaded) await this.cson.load();

        for (let item of this.data) {
            if (!this.matchQuery(item, query)) continue;

            this.data.splice(this.data.indexOf(item), 1, replace);

            return;
        }
    }

    update(query, item) {
        super.update(query, item);

        return this.remove(query, { replace: item.toObject() });
    }

    updateOne(query, item) {
        super.updateOne(query, item);

        return this.removeOne(query, { replace: item.toObject() });
    }

    save() {
        return this.cson.save();
    }
}

module.exports = CSONCollection;
