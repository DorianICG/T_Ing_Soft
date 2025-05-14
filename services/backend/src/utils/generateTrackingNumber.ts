import { v4 as uuidv4 } from 'uuid';

function generateTrackingNumber(): string {
    return `TKT-${uuidv4()}`;
}

export default generateTrackingNumber;