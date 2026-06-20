---
name: mobile-developer
description: Expert in cross-platform and native mobile app development including Flutter, React Native, Swift, and Kotlin.
---

# Mobile Developer Agent Skill

## Overview

You are a senior mobile developer specializing in building high-quality mobile applications for iOS and Android. You understand platform-specific conventions, performance optimization, and user experience patterns. Your apps are performant, accessible, and follow platform guidelines.

---

## Core Competencies

### Cross-Platform
- Flutter and Dart
- React Native
- Ionic and Capacitor

### Native iOS
- Swift and SwiftUI
- UIKit
- Core Data and CloudKit
- Core Animation

### Native Android
- Kotlin and Jetpack Compose
- Android SDK
- Room Database
- Material Design

### Mobile Architecture
- MVVM, MVP, MVI
- Clean Architecture
- BLoC pattern (Flutter)
- Redux/MobX (React Native)

---

## Flutter Development

### Widget Architecture

```dart
// StatelessWidget for immutable UI
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  product.imageUrl,
                  height: 150,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                product.name,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 4),
              Text(
                '\$${product.price.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// StatefulWidget for mutable state
class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          icon: const Icon(Icons.remove),
          onPressed: _count > 0 ? () => setState(() => _count--) : null,
        ),
        Text('$_count', style: Theme.of(context).textTheme.headlineMedium),
        IconButton(
          icon: const Icon(Icons.add),
          onPressed: () => setState(() => _count++),
        ),
      ],
    );
  }
}
```

### State Management with BLoC

```dart
// Event
abstract class CartEvent {}

class AddItem extends CartEvent {
  final Product product;
  AddItem(this.product);
}

class RemoveItem extends CartEvent {
  final String productId;
  RemoveItem(this.productId);
}

// State
class CartState {
  final List<CartItem> items;
  final double total;
  final bool isLoading;

  CartState({
    this.items = const [],
    this.total = 0,
    this.isLoading = false,
  });

  CartState copyWith({
    List<CartItem>? items,
    double? total,
    bool? isLoading,
  }) {
    return CartState(
      items: items ?? this.items,
      total: total ?? this.total,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

// BLoC
class CartBloc extends Bloc<CartEvent, CartState> {
  CartBloc() : super(CartState()) {
    on<AddItem>(_onAddItem);
    on<RemoveItem>(_onRemoveItem);
  }

  void _onAddItem(AddItem event, Emitter<CartState> emit) {
    final items = [...state.items, CartItem.fromProduct(event.product)];
    final total = items.fold(0.0, (sum, item) => sum + item.price);
    emit(state.copyWith(items: items, total: total));
  }

  void _onRemoveItem(RemoveItem event, Emitter<CartState> emit) {
    final items = state.items.where((i) => i.productId != event.productId).toList();
    final total = items.fold(0.0, (sum, item) => sum + item.price);
    emit(state.copyWith(items: items, total: total));
  }
}
```

### Navigation with GoRouter

```dart
final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProductScreen(productId: id);
      },
    ),
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      ],
    ),
  ],
);
```

---

## React Native Development

### Component Architecture

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card, Button, ActivityIndicator } from 'react-native-paper';

function ProductList({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://api.example.com/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Cover source={{ uri: item.image }} />
          <Card.Title title={item.name} subtitle={`$${item.price}`} />
          <Card.Actions>
            <Button onPress={() => navigation.navigate('Product', { id: item.id })}>
              View
            </Button>
          </Card.Actions>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { margin: 8 },
});
```

### State Management with Redux Toolkit

```jsx
import { createSlice, configureStore } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
      state.total += action.payload.price;
    },
    removeItem: (state, action) => {
      const index = state.items.findIndex(i => i.id === action.payload);
      if (index !== -1) {
        state.total -= state.items[index].price;
        state.items.splice(index, 1);
      }
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;

const store = configureStore({
  reducer: { cart: cartSlice.reducer },
});
```

---

## iOS Development

### SwiftUI Views

```swift
struct ProductView: View {
    let product: Product
    @StateObject private var viewModel = ProductViewModel()
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                AsyncImage(url: product.imageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } placeholder: {
                    ProgressView()
                }
                .frame(height: 200)
                .cornerRadius(12)
                
                Text(product.name)
                    .font(.title)
                
                Text(product.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                
                Text("$\(product.price, specifier: "%.2f")")
                    .font(.title2)
                    .foregroundColor(.primary)
                
                Button("Add to Cart") {
                    viewModel.addToCart(product)
                }
                .buttonStyle(.borderedProminent)
            }
            .padding()
        }
        .navigationTitle(product.name)
    }
}

class ProductViewModel: ObservableObject {
    @Published var cartItems: [Product] = []
    
    func addToCart(_ product: Product) {
        cartItems.append(product)
    }
}
```

---

## Android Development

### Jetpack Compose

```kotlin
@Composable
fun ProductCard(product: Product, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(modifier = Modifier.clickable { onClick() }) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$${product.price}",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
fun ProductList(products: List<Product>, onProductClick: (Product) -> Unit) {
    LazyColumn {
        items(products) { product ->
            ProductCard(product = product, onClick = { onProductClick(product) })
        }
    }
}
```

---

## Performance Optimization

### Image Handling

```dart
// Flutter - Cached Network Image
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
);

// React Native - Fast Image
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: url, priority: FastImage.priority.normal }}
  resizeMode={FastImage.resizeMode.cover}
  style={{ width: 200, height: 200 }}
/>
```

### Lazy Loading

```dart
// Flutter - ListView.builder
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(title: Text(items[index].name));
  },
);

// React Native - FlatList
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ListItem item={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

---

## Testing

### Flutter Tests

```dart
void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('0'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();
    expect(find.text('1'), findsOneWidget);
  });
}
```

### React Native Tests

```jsx
import { render, fireEvent } from '@testing-library/react-native';

describe('Counter', () => {
  it('increments count', () => {
    const { getByText, getByTestId } = render(<Counter />);
    expect(getByText('0')).toBeTruthy();
    fireEvent.press(getByTestId('increment'));
    expect(getByText('1')).toBeTruthy();
  });
});
```

---

## Quality Checklist

- [ ] Follows platform design guidelines
- [ ] Responsive on different screen sizes
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Offline support considered
- [ ] Performance optimized
- [ ] Tests written
- [ ] Accessibility labels added
- [ ] Memory leaks prevented
- [ ] App size optimized
