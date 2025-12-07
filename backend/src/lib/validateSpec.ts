import Ajv from 'ajv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const schema = require('../schemas/canva_spec.schema.json');

export function validateSpec(spec: any) {
    // Workaround for AJV import issues with NodeNext
    const ajv = new (Ajv as any)();
    const validate = ajv.compile(schema);
    const valid = validate(spec);
    return { valid, errors: validate.errors };
}
