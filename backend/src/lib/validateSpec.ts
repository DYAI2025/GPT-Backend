import Ajv from 'ajv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const schema = require('../schemas/canva_spec.schema.json');

export function validateSpec(spec: any) {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(spec);
    return { valid, errors: validate.errors };
}
