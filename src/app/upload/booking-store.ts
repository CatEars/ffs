import { join } from '@std/path/join';
import { getUploadDir } from '../files/cache-folder.ts';
import { logger } from '../logging/loggers.ts';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export type UploadBooking = {
    directory: string;
    fileName: string;
    tempFile: string;
    createdAt: number;
};

const bookings = new Map<string, UploadBooking>();

function getBookingDir(token: string): string {
    return join(getUploadDir(), token);
}

function getBookingFilePath(token: string): string {
    return join(getBookingDir(token), 'booking.json');
}

export async function createBooking(directory: string, fileName: string): Promise<string> {
    const token = crypto.randomUUID();
    const bookingDir = getBookingDir(token);
    const tempFile = join(bookingDir, fileName);
    await Deno.mkdir(bookingDir, { recursive: true });
    const f = await Deno.open(tempFile, { createNew: true, write: true });
    f.close();

    const booking: UploadBooking = { directory, fileName, tempFile, createdAt: Date.now() };
    await Deno.writeTextFile(getBookingFilePath(token), JSON.stringify(booking, null, 4));
    bookings.set(token, booking);
    return token;
}

export function getBooking(token: string): UploadBooking | undefined {
    return bookings.get(token);
}

export async function deleteBooking(token: string): Promise<void> {
    bookings.delete(token);
    try {
        await Deno.remove(getBookingDir(token), { recursive: true });
    } catch {
        // Booking directory may already be gone; ignore
    }
}

export async function loadAndCleanBookings(): Promise<void> {
    const uploadDir = getUploadDir();
    try {
        for await (const entry of Deno.readDir(uploadDir)) {
            if (!entry.isDirectory) continue;
            const token = entry.name;
            const bookingFilePath = getBookingFilePath(token);
            try {
                const text = await Deno.readTextFile(bookingFilePath);
                const booking = JSON.parse(text) as UploadBooking;
                if (Date.now() - (booking.createdAt ?? Date.now()) > THREE_DAYS_MS) {
                    await Deno.remove(getBookingDir(token), { recursive: true });
                    logger.info('Removed stale upload booking', token);
                } else {
                    bookings.set(token, booking);
                }
            } catch {
                logger.warn('Could not load upload booking for token', token, '— skipping');
            }
        }
    } catch {
        // Upload directory may not exist yet; ignore
    }
}
