import { lowerCaseFirstLetter } from "./utils";
import EventEmitter from "./EventEmitter";

/**
 * Class representing a storage system using OPFS.
 * Inherits from EventEmitter to handle events.
 */
export default class OPFSStorage extends EventEmitter {
  constructor() {
    super();
    this.root = null;
    this.directories = {};
    this.files = [];
    return new Proxy(this, {
      get(target, prop) {
        if (prop.startsWith("on") && prop.length > 2) {
          const eventName = lowerCaseFirstLetter(prop.slice(2));
          return (callback) => target.on(eventName, callback);
        }
        return target[prop];
      },
    });
  }

  /**
   * Initializes the storage system by getting the root directory
   * and populating the directories and files.
   * Emits "initialized" event on success or "error" event on failure.
   */
  async init() {
    try {
      this.root = await navigator.storage.getDirectory();
      for await (const [name, handle] of this.root.entries()) {
        if (handle.kind === "directory") {
          this.directories[name] = [];
        } else if (handle.kind === "file") {
          this.files.push(name);
        }
      }
      this.emit("initialized");
    } catch (error) {
      console.error("Initialization failed:", error);
      this.emit("error", error);
    }
  }

  /**
   * Creates a directory within the storage system.
   * @param {string} dirName - The name of the directory to create.
   * Emits "dirCreated" event on success or "error" event on failure.
   */
  async createDir(dirName = "dir") {
    try {
      const rootDir = this.root;
      if (!this.directories[dirName]) {
        this.directories[dirName] = [];
        const dir = await rootDir.getDirectoryHandle(dirName, { create: true });
        console.log(`Directory "${dir.name}" created.`);
        this.emit("dirCreated", dirName);
      } else {
        console.log(`Directory "${dirName}" already exists.`);
      }
    } catch (error) {
      console.error(`Failed to create directory "${dirName}":`, error);
      this.emit("error", error);
    }
  }

  /**
   * Creates a file within the storage system.
   * @param {string} fileName - The name of the file to create.
   * @param {string} [dirName=null] - The directory to create the file in. If not provided, file is created at root level.
   * Emits "fileCreated" event on success or "error" event on failure.
   */
  async createFile(fileName, dirName = null) {
    try {
      const rootDir = this.root;
      if (dirName && this.directories[dirName]) {
        const dir = await rootDir.getDirectoryHandle(dirName, { create: true });
        await dir.getFileHandle(fileName, { create: true });
        this.directories[dirName].push(fileName);
        console.log(`File "${fileName}" created in directory "${dirName}".`);
        this.emit("fileCreated", { fileName, dirName });
      } else if (dirName && !this.directories[dirName]) {
        console.log(`Directory "${dirName}" does not exist.`);
      } else {
        await rootDir.getFileHandle(fileName, { create: true });
        this.files.push(fileName);
        console.log(`File "${fileName}" created at root path.`);
        this.emit("fileCreated", { fileName });
      }
    } catch (error) {
      console.error(`Failed to create file "${fileName}":`, error);
      this.emit("error", error);
    }
  }

  /**
   * Reads the content of a file.
   * @param {string} fileName - The name of the file to read.
   * @param {string} [dirName=null] - The directory of the file. If not provided, file is read from root level.
   * @returns {Promise<string>} - The content of the file.
   * Emits "error" event on failure.
   */
  async readFile(fileName, dirName = null) {
    try {
      const rootDir = this.root;
      let file;
      if (dirName) {
        const dir = await rootDir.getDirectoryHandle(dirName);
        file = await dir.getFileHandle(fileName);
      } else {
        file = await rootDir.getFileHandle(fileName);
      }
      const fileData = await file.getFile();
      return fileData.text();
    } catch (error) {
      console.error(`Failed to read file "${fileName}":`, error);
      this.emit("error", error);
    }
  }

  /**
   * Writes content to a file.
   * @param {string} fileName - The name of the file to write to.
   * @param {string} content - The content to write.
   * @param {string} [dirName=null] - The directory of the file. If not provided, file is written at root level.
   * Emits "error" event on failure.
   */
  async writeFile(fileName, content, dirName = null) {
    try {
      const rootDir = this.root;
      let file;
      if (dirName) {
        const dir = await rootDir.getDirectoryHandle(dirName, { create: true });
        file = await dir.getFileHandle(fileName, { create: true });
      } else {
        file = await rootDir.getFileHandle(fileName, { create: true });
      }
      const writable = await file.createWritable();
      await writable.write(content);
      await writable.close();
      console.log(`Content written to file "${fileName}".`);
    } catch (error) {
      console.error(`Failed to write file "${fileName}":`, error);
      this.emit("error", error);
    }
  }

  /**
   * Deletes a file from the storage system.
   * @param {string} fileName - The name of the file to delete.
   * @param {string} [dirName=null] - The directory of the file. If not provided, file is deleted from root level.
   * Emits "error" event on failure.
   */
  async deleteFile(fileName, dirName = null) {
    try {
      const rootDir = this.root;
      if (dirName) {
        const dir = await rootDir.getDirectoryHandle(dirName);
        await dir.removeEntry(fileName);
        this.directories[dirName] = this.directories[dirName].filter(
          (file) => file !== fileName
        );
        console.log(`File "${fileName}" deleted from directory "${dirName}".`);
      } else {
        await rootDir.removeEntry(fileName);
        this.files = this.files.filter((file) => file !== fileName);
        console.log(`File "${fileName}" deleted from root path.`);
      }
    } catch (error) {
      console.error(`Failed to delete file "${fileName}":`, error);
      this.emit("error", error);
    }
  }

  /**
   * Deletes a directory and its contents from the storage system.
   * @param {string} dirName - The name of the directory to delete.
   * Emits "error" event on failure.
   */
  async deleteDir(dirName) {
    try {
      if (this.directories[dirName]) {
        await this.root.removeEntry(dirName, { recursive: true });
        delete this.directories[dirName];
        console.log(`Directory "${dirName}" and its contents deleted.`);
      } else {
        console.log(`Directory "${dirName}" does not exist.`);
      }
    } catch (error) {
      console.error(`Failed to delete directory "${dirName}":`, error);
      this.emit("error", error);
    }
  }

  /**
   * Downloads a file from the storage system.
   * @param {string} fileName - The name of the file to download.
   * @param {string} [dirName=null] - The directory of the file. If not provided, file is downloaded from root level.
   */
  async downloadFile(fileName, dirName = null) {
    try {
      const fileContent = await this.readFile(fileName, dirName);
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log(`File "${fileName}" downloaded.`);
    } catch (error) {
      console.error(`Failed to download file "${fileName}":`, error);
    }
  }

  /**
   * Sends a file to the server.
   * @param {string} fileName - The name of the file to send.
   * @param {string} [dirName=null] - The directory of the file. If not provided, file is sent from root level.
   * @param {string} serverUrl - The server URL to send the file to.
   */
  async sendFileToServer(fileName, dirName = null, serverUrl) {
    try {
      const fileContent = await this.readFile(fileName, dirName);
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([fileContent], { type: "text/plain" }),
        fileName
      );
      const response = await fetch(serverUrl, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log(`File "${fileName}" sent to server.`);
      } else {
        console.error(
          `Failed to send file "${fileName}" to server:`,
          response.statusText
        );
      }
    } catch (error) {
      console.error(`Failed to send file "${fileName}" to server:`, error);
    }
  }
}
