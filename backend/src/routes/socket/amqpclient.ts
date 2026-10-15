import * as amqp from 'amqplib';
import { TaskOutDto } from '../../dto/task.dto';

export type TaskChange = {
  type: string;
  task: TaskOutDto;
};

/**
 * Represents a RabbitMQ chat client.
 */
export class RabbitMqChatClient {
  clientId: string;
  queueName: string;
  routingPattern: string;
  channel!: amqp.Channel;
  connection: amqp.Connection;
  exchange!: string;

  /**
   * Creates an instance of RabbitMqChatClient.
   * @param clientId - The unique identifier for the client.
   * @param exchange - The name of the exchange.
   * @param routingPattern - The routing pattern for the queue.
   * @param connection - The AMQP connection.
   */
  constructor(clientId: string, exchange: string, routingPattern: string, connection: amqp.Connection) {
    this.clientId = clientId;
    this.queueName = `queue-${this.clientId}-${Date.now()}`;
    this.routingPattern = `${routingPattern}`;
    this.connection = connection;
    this.exchange = exchange;
  }

  /**
   * Creates a client-specific queue and binds it to the exchange with the routing pattern.
   * @returns A promise that resolves when the queue is created and bound.
   */
  async createClientQueue() {
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic');
    await this.channel.assertQueue(this.queueName, { exclusive: true });
    await this.channel.bindQueue(this.queueName, this.exchange, this.routingPattern);
  }

  /**
   * Closes the AMQP channel and connection.
   * @returns A promise that resolves when the channel and connection are closed.
   */
  async destroyClientQueue() {
    console.log('Closing AMQP connection');
    await this.channel.close();
    await this.connection.close();
  }

  /**
   * Changes the routing key for the queue.
   * @param newRoutingPattern - The new routing pattern to bind the queue to.
   * @returns A promise that resolves when the routing key is changed.
   */
  async changeRoutingKey(newRoutingPattern: string) {
    if (newRoutingPattern) {
      await this.channel.unbindQueue(this.queueName, this.exchange, this.routingPattern);
      this.routingPattern = newRoutingPattern;
      await this.channel.bindQueue(this.queueName, this.exchange, this.routingPattern);
      console.log(`Routing key changed to ${this.routingPattern}`);
    }
  }

  /**
   * Sets up a consumer for task change messages.
   * @param callback - The callback function to handle task change messages.
   */
  onTaskChange(callback: (message: TaskChange) => void) {
    this.channel.consume(this.queueName, (data) => {
      if (data) {
        console.log(`[${this.clientId}] received message on binding key: ${data.fields.routingKey}`);
        const message = JSON.parse(data.content.toString()) as TaskChange;
        callback(message);
        this.channel.ack(data);
      }
    });
  }

  /**
   * Sets up a consumer for vote messages.
   * @param callback - The callback function to handle vote messages.
   */
  onVote(callback: (message: any) => void) {
    this.channel.consume(this.queueName, (data) => {
      if (data) {
        console.log(`[${this.clientId}] received message on binding key: ${data.fields.routingKey}`);
        const message = JSON.parse(data.content.toString());
        callback(message);
        this.channel.ack(data);
      }
    });
  }
}
