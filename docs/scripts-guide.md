# Price Monitor Scripts Guide

This document provides a quick reference for all the scripts included in the price monitor project.

## Node.js Scripts

These scripts require Node.js to be installed:

### 1. Main Application (`src/index.js`)

The main entry point for the application. Starts the scheduler and monitors prices at regular intervals.

**Usage:**
```
npm start
```

### 2. Add Product (`src/cli/add-product.js`)

Interactive script to add a new product to monitor.

**Usage:**
```
npm run add-product
```

### 3. Check Prices (`src/cli/check-prices.js`)

Check current prices for all monitored products.

**Usage:**
```
npm run check-prices
```

## PowerShell Demo Scripts

These scripts can be run without Node.js to demonstrate the functionality:

### 1. Minimal Demo (`minimal-demo.ps1`)

A very simple demonstration of price monitoring with simulated price drops.

**Usage:**
```
powershell -ExecutionPolicy Bypass -File minimal-demo.ps1
```

### 2. Simple Demo (`demo-simple.ps1`)

An interactive demo with basic menu functionality.

**Usage:**
```
powershell -ExecutionPolicy Bypass -File demo-simple.ps1
```

### 3. Full Demo (`demo-price-monitor.ps1`)

A comprehensive demonstration with all features.

**Usage:**
```
powershell -ExecutionPolicy Bypass -File demo-price-monitor.ps1
```

## Batch File

### Run Demo (`run-demo.bat`)

Simple batch file to run the PowerShell demo with the correct execution policy.

**Usage:**
```
run-demo.bat
```