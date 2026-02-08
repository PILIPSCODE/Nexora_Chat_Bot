import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TempCleanupWorkerService implements OnModuleInit {
  private readonly logger = new Logger(TempCleanupWorkerService.name);
  private readonly tempDir = path.join(process.cwd(), 'uploads', 'temp');
  private readonly maxAgeMinutes = 5;

  onModuleInit() {
    this.logger.log(
      `TempCleanupWorker initialized. Will clean files older than ${this.maxAgeMinutes} minutes in ${this.tempDir}`,
    );
    // Run cleanup on startup
    this.cleanupTempFiles();
  }

  /**
   * Runs every minute to check and delete files older than 5 minutes
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupTempFiles() {
    try {
      // Ensure temp directory exists
      if (!fs.existsSync(this.tempDir)) {
        this.logger.debug(`Temp directory does not exist: ${this.tempDir}`);
        return;
      }

      const now = Date.now();
      const maxAgeMs = this.maxAgeMinutes * 60 * 1000;
      let deletedCount = 0;

      const files = fs.readdirSync(this.tempDir);

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);

        try {
          const stats = fs.statSync(filePath);

          // Check if file/folder is older than maxAgeMinutes
          const fileAgeMs = now - stats.mtimeMs;

          if (fileAgeMs > maxAgeMs) {
            if (stats.isDirectory()) {
              // Recursively delete directory
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              // Delete file
              fs.unlinkSync(filePath);
            }
            deletedCount++;
            this.logger.debug(`Deleted: ${filePath} (age: ${Math.round(fileAgeMs / 60000)} minutes)`);
          }
        } catch (err) {
          this.logger.error(`Failed to process ${filePath}: ${err.message}`);
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`Cleanup completed: ${deletedCount} item(s) deleted from temp folder`);
      }
    } catch (err) {
      this.logger.error(`Cleanup job failed: ${err.message}`);
    }
  }
}
