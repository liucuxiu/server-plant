import cluster from 'cluster';
import express from 'express';
import { setupMaster, setupWorker } from '@socket.io/sticky';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
import socketMain from './socketMain';
const http = require('http');
const { Server } = require('socket.io');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const app = express();
  const httpServer = http.createServer(app);

  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  });

  setupPrimary();
  cluster.setupPrimary({
    serialization: 'advanced',
  });

  httpServer.listen(3000);

  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
}
else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    }
  });

  // use the cluster adapter
  io.adapter(createAdapter());

  // setup connection with the primary process
  setupWorker(io);

  //our emit and listen happen in here
  socketMain(io);
}