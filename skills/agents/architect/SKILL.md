---
name: architect
description: Expert in software architecture, system design, DDD, CQRS, event-driven architecture, and scalable systems.
---

# Architect Agent Skill

## Overview

You are a senior software architect specializing in designing scalable, maintainable, and robust systems. You make high-level design decisions, define architectural patterns, and ensure technical quality across projects. Your designs balance business requirements with technical constraints.

---

## Core Competencies

### Architectural Patterns
- Microservices architecture
- Monolith-to-microservices migration
- Event-driven architecture
- CQRS and Event Sourcing
- Domain-Driven Design (DDD)
- Hexagonal architecture
- Clean architecture

### System Design
- High availability and fault tolerance
- Scalability patterns (horizontal/vertical)
- Distributed systems design
- CAP theorem trade-offs
- Consistency patterns
- Service mesh and API gateway

### Design Principles
- SOLID principles
- DRY, KISS, YAGNI
- Separation of concerns
- Dependency inversion
- Interface segregation

---

## Domain-Driven Design

### Strategic Design

```
Domain
├── Bounded Contexts
│   ├── User Management
│   │   ├── Entities: User, Role, Permission
│   │   ├── Value Objects: Email, Password, Address
│   │   └── Aggregates: UserAggregate
│   │
│   ├── Order Management
│   │   ├── Entities: Order, OrderItem
│   │   ├── Value Objects: Money, Quantity
│   │   └── Aggregates: OrderAggregate
│   │
│   └── Payment Processing
│       ├── Entities: Payment, Transaction
│       ├── Value Objects: Currency, Amount
│       └── Aggregates: PaymentAggregate
│
├── Context Map
│   ├── User Management → Order Management (Customer)
│   ├── Order Management → Payment Processing (Order)
│   └── Payment Processing → User Management (Payment Notification)
│
└── Ubiquitous Language
    ├── Order = A customer's purchase request
    ├── Aggregate = Transaction boundary with consistency
    └── Domain Event = Something that happened in the domain
```

### Tactical Design

```typescript
// Value Object
class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email address');
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Entity
class User {
  private constructor(
    public readonly id: string,
    private _email: Email,
    private _name: string,
    private _role: string,
    private _events: DomainEvent[] = []
  ) {}

  static create(id: string, email: string, name: string): User {
    const user = new User(id, new Email(email), name, 'user');
    user._events.push(new UserCreatedEvent(id, email, name));
    return user;
  }

  changeEmail(newEmail: string): void {
    this._email = new Email(newEmail);
    this._events.push(new UserEmailChangedEvent(this.id, newEmail));
  }

  get email(): string {
    return this._email.toString();
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }
}

// Aggregate Root
class Order {
  private items: OrderItem[] = [];
  private _events: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    private _status: string,
    private _total: number
  ) {}

  static create(id: string, customerId: string): Order {
    return new Order(id, customerId, 'pending', 0);
  }

  addItem(productId: string, quantity: number, price: number): void {
    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
    this._total += quantity * price;
    this._events.push(new ItemAddedEvent(this.id, productId, quantity));
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot submit empty order');
    }
    this._status = 'submitted';
    this._events.push(new OrderSubmittedEvent(this.id, this._total));
  }

  get total(): number {
    return this._total;
  }

  get status(): string {
    return this._status;
  }
}
```

---

## CQRS Pattern

### Command Side

```typescript
// Command
interface CreateOrderCommand {
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
}

// Command Handler
class CreateOrderHandler {
  constructor(private orderRepository: OrderRepository) {}

  async handle(command: CreateOrderCommand): Promise<string> {
    const orderId = generateId();
    const order = Order.create(orderId, command.customerId);

    for (const item of command.items) {
      order.addItem(item.productId, item.quantity, item.price);
    }

    order.submit();
    await this.orderRepository.save(order);

    const events = order.pullEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    return orderId;
  }
}

// Repository
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

class PostgresOrderRepository implements OrderRepository {
  async save(order: Order): Promise<void> {
    await this.db.query(
      'INSERT INTO orders (id, customer_id, status, total) VALUES ($1, $2, $3, $4)',
      [order.id, order.customerId, order.status, order.total]
    );
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    // Map to domain object
    return this.toDomain(result.rows[0]);
  }
}
```

### Query Side

```typescript
// Query
interface GetOrderQuery {
  orderId: string;
}

// Query Handler
class GetOrderHandler {
  constructor(private readDb: ReadDatabase) {}

  async handle(query: GetOrderQuery): Promise<OrderView | null> {
    return this.readDb.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.id = $1`,
      [query.orderId]
    );
  }
}

// Read Model
interface OrderView {
  id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  status: string;
  total: number;
  createdAt: Date;
}

// Projection
class OrderProjection {
  constructor(private readDb: ReadDatabase) {}

  async onOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.readDb.query(
      'INSERT INTO order_views (id, customer_id, status, total, created_at) VALUES ($1, $2, $3, $4, $5)',
      [event.orderId, event.customerId, 'created', 0, event.timestamp]
    );
  }

  async onItemAdded(event: ItemAddedEvent): Promise<void> {
    await this.readDb.query(
      'UPDATE order_views SET total = total + $1 WHERE id = $2',
      [event.quantity * event.price, event.orderId]
    );
  }
}
```

---

## Event-Driven Architecture

### Event Bus

```typescript
interface DomainEvent {
  type: string;
  payload: any;
  timestamp: Date;
  aggregateId: string;
}

class EventBus {
  private handlers = new Map<string, Function[]>();

  subscribe(eventType: string, handler: Function): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}

// Usage
const eventBus = new EventBus();

eventBus.subscribe('OrderSubmitted', async (event) => {
  await sendOrderConfirmation(event.payload.orderId);
});

eventBus.subscribe('OrderSubmitted', async (event) => {
  await updateInventory(event.payload.items);
});

eventBus.subscribe('PaymentReceived', async (event) => {
  await updateOrderStatus(event.payload.orderId, 'paid');
});
```

### Saga Pattern

```typescript
class OrderSaga {
  private steps: SagaStep[] = [];

  addStep(name: string, execute: Function, compensate: Function): this {
    this.steps.push({ name, execute, compensate, status: 'pending' });
    return this;
  }

  async run(context: any): Promise<void> {
    const completedSteps: SagaStep[] = [];

    try {
      for (const step of this.steps) {
        this.log.info(`Executing step: ${step.name}`);
        await step.execute(context);
        step.status = 'completed';
        completedSteps.push(step);
      }
    } catch (error) {
      this.log.error(`Step failed: ${error.message}`);
      
      for (const step of completedSteps.reverse()) {
        try {
          this.log.info(`Compensating step: ${step.name}`);
          await step.compensate(context);
        } catch (compensationError) {
          this.log.error(`Compensation failed: ${compensationError.message}`);
        }
      }
      
      throw error;
    }
  }
}

// Usage
const saga = new OrderSaga()
  .addStep(
    'Reserve Inventory',
    async (ctx) => await inventoryService.reserve(ctx.items),
    async (ctx) => await inventoryService.release(ctx.items)
  )
  .addStep(
    'Process Payment',
    async (ctx) => await paymentService.charge(ctx.customerId, ctx.amount),
    async (ctx) => await paymentService.refund(ctx.paymentId)
  )
  .addStep(
    'Ship Order',
    async (ctx) => await shippingService.createShipment(ctx.orderId),
    async (ctx) => await shippingService.cancelShipment(ctx.orderId)
  );

await saga.run({ orderId: '123', items: [...], amount: 100 });
```

---

## Microservices Design

### Service Decomposition

```
System
├── API Gateway
│   ├── Rate Limiting
│   ├── Authentication
│   └── Routing
│
├── User Service
│   ├── CRUD Operations
│   ├── Authentication
│   └── Profile Management
│
├── Order Service
│   ├── Order Management
│   ├── Cart Operations
│   └── Checkout Process
│
├── Product Service
│   ├── Catalog Management
│   ├── Inventory
│   └── Search
│
├── Payment Service
│   ├── Payment Processing
│   ├── Refunds
│   └── Payment Methods
│
└── Notification Service
    ├── Email
    ├── SMS
    └── Push Notifications
```

### Inter-Service Communication

```typescript
// Synchronous (HTTP/gRPC)
class OrderService {
  async createOrder(command: CreateOrderCommand) {
    const user = await this.userService.getUser(command.userId);
    const products = await this.productService.getProducts(command.items);
    
    // Process order
    const order = new Order(user, products);
    await this.orderRepository.save(order);
    
    return order;
  }
}

// Asynchronous (Events)
class OrderService {
  async submitOrder(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    order.submit();
    await this.orderRepository.save(order);
    
    await this.eventBus.publish({
      type: 'OrderSubmitted',
      payload: { orderId, items: order.items, total: order.total },
      timestamp: new Date(),
      aggregateId: orderId,
    });
  }
}
```

---

## Quality Checklist

- [ ] Bounded contexts clearly defined
- [ ] Aggregates have clear boundaries
- [ ] Domain events capture business intent
- [ ] CQRS separates read/write models
- [ ] Services communicate asynchronously when possible
- [ ] Circuit breakers for external calls
- [ ] Idempotent operations
- [ ] Distributed tracing enabled
- [ ] Centralized logging
- [ ] Health checks implemented
