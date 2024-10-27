# OPFSStorage Library

## Overview

`OPFSStorage` is a library for managing files and directories using the Origin Private File System (OPFS) with a built-in event-handling system. It extends the functionality of the EventEmitter to provide a robust and flexible storage solution.

## Features

- Create and manage directories and files.
- Read and write file contents.
- Delete files and directories.
- Download files to the client.
- Send files to a server.
- Event-driven architecture for handling various storage events.

## Installation

To install `OPFSStorage`, use npm:

```sh
npm install opfs-storage

```

## Usage

### Importing the Library

First, import the `OPFSStorage` class into your project:

``` javascript
import OPFSStorage from 'opfs-storage';

```

### Initializing the Storage

Create an instance of OPFSStorage and initialize it:

``` javascript
const storage = new OPFSStorage();

storage.init().then(() => {
    console.log("Storage initialized");
});

```

### Event Handling

You can set up event listeners using the onEventName format. For example:

``` javascript
storage.onInitialized(() => {
    console.log("Storage has been initialized");
});

storage.onError((error) => {
    console.error("An error occurred:", error);
});

```

### Creating Directories and Files

Create a directory:

``` javascript
storage.createDir('myDirectory');

```

Create a file within a directory or at the root level:

``` javascript
storage.createFile('myFile.txt', 'myDirectory');

```

### Reading and Writing Files

Read the content of a file:

``` javascript
storage.readFile('myFile.txt', 'myDirectory').then((content) => {
    console.log(content);
});

```

Write content to a file:

``` javascript
storage.writeFile('myFile.txt', 'Hello, World!', 'myDirectory');

```

### Deleting Files and Directories

Delete a file:

``` javascript
storage.deleteFile('myFile.txt', 'myDirectory');

```

Delete a directory and its contents:

``` javascript
storage.deleteDir('myDirectory');

```

### Downloading and Sending Files

Download a file:

``` javascript
storage.downloadFile('myFile.txt', 'myDirectory');

```

Send a file to a server:

``` javascript
storage.sendFileToServer('myFile.txt', 'myDirectory', 'https://example.com/upload');

```

### Author

Vyshnav - [@vaishnavpk22](https://x.com/vaishnavpk22)

### License
MIT