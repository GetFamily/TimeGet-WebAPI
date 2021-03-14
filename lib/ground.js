const axios = require('axios').default;
axios.defaults.baseURL = 'http://localhost:3131';

async function get(model, { filter }) {
    const data = {
        entity: model.name,
    };
    if (filter) {
        if (model.strict) { // remove extra params
            const allKeys = model.keys.map(key => model.fields[key].name);
            for (const property in filter) {
                if (Object.hasOwnProperty.call(filter, property) && !allKeys.includes(property)) {
                    delete filter[property];
                }
            }
        }
        data.keySearch = Object.keys(filter).map(key => `${key}_${filter[key]}`).join(',');
    }

    const response = await axios({
        url: '/Data',
        method: 'POST',
        data,
    });
    const results = response.data.data;
    results.forEach(result => {
        Object.assign(result, JSON.parse(result.body));
        result.keys.split(',').forEach(keyValue => {
            const [key, value] = keyValue.split('_');
            result[key] = value;
        });
        delete result.keys;
        delete result.body;
    });
    return results;
};

async function put(model, obj) {
    // TODO: Should be computed from defaultFields
    const data = {
        entity: model.name,
        offlineId: obj.offlineId,
        creatorId: obj.creatorId,
        keys: model.keys.map(key => `${model.fields[key].name}_${obj[model.fields[key].name]}`).join(','),
    };
    if (obj.id) {
        data.id = obj.id;
    }
    if (obj.rev) {
        data.rev = obj.rev;
    }
    if (obj.createdAt) {
        data.createdAt = obj.createdAt;
    }
    if (obj.updatedAt) {
        data.updatedAt = obj.updatedAt;
    }

    const body = {};
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const property = obj[key];
            const fieldIndex = model.fields.findIndex(field => field.name === key);
            if (model.strict === true && fieldIndex < 0) {
                continue;
            }
            else if (model.keys.includes(fieldIndex)) {
                continue;
            }
            body[key] = property;
        }
    }
    data.body = JSON.stringify(body);

    const response = await axios({
        url: '/Data',
        method: 'PUT',
        data,
    });
    return response;
};

module.exports = function GroundFactory(models) {
    const instance = {
        defaultFields: require('./default-fields'),
    };

    for (const model of models) {
        const modelProxy = {
            get: ({ filter }) => get(model, { filter }),
            put: (obj) => put(model, obj),
        }
        Object.defineProperty(instance, model.name, {
            value: modelProxy,
            enumerable: true,
            configurable: false,
            writable: false,
        });
    }

    return instance;
}