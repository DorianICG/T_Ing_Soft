function generateTrackingNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random.toString().padStart(3, '0')}`;
}

export default generateTrackingNumber;