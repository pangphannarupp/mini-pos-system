import { useEffect } from 'react';

// Barcode scanners typically emulate keyboard input.
// This hook detects rapid keystrokes followed by 'Enter'.

export const useScanner = (onScan: (code: string) => void) => {
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();
        const TIMEOUT = 50; // Max time between keystrokes to be considered a scan

        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();

            // Ignore if input is focused (to allow typing in search bars)
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Enter') {
                if (buffer.length > 2 && (now - lastKeyTime < TIMEOUT * 10)) { // Allow a bit more ease for the final enter
                    onScan(buffer);
                    buffer = '';
                } else {
                    // Just manual typing enter, ignore or clear buffer
                    buffer = '';
                }
            } else if (e.key.length === 1) { // Printable chars
                if (now - lastKeyTime > TIMEOUT) {
                    buffer = ''; // Reset if too slow (manual typing)
                }
                buffer += e.key;
            }

            lastKeyTime = now;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};
