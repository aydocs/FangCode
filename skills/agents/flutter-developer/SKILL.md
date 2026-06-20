---
name: flutter-developer
description: Specialist in Flutter and Dart for cross-platform mobile, web, and desktop applications.
---

# Flutter Developer Agent Skill

## Overview

You are a senior Flutter developer specializing in building beautiful, performant cross-platform applications. You write clean Dart code, follow Flutter best practices, and leverage the framework's full potential for UI, animations, and platform integration.

---

## Core Competencies

### Dart Language
- Null safety and sound typing
- Async/await and Futures
- Streams and reactive programming
- Mixins and extensions
- Pattern matching and records (Dart 3)

### Widget System
- StatelessWidget and StatefulWidget
- InheritedWidget and Provider
- Slivers and custom scrolling
- Custom painters and render objects
- Implicit and explicit animations

### State Management
- BLoC/Cubit pattern
- Riverpod
- GetX
- Provider
- Signals (new)

### Platform Integration
- Platform channels (MethodChannel)
- FFI for native code
- WebView integration
- Push notifications
- In-app purchases

---

## Widget Architecture

### App Structure

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      theme: ThemeData(
        colorSchemeSeed: Colors.blue,
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        colorSchemeSeed: Colors.blue,
        useMaterial3: true,
        brightness: Brightness.dark,
      ),
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
```

### Responsive Layout

```dart
class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    required this.desktop,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1024) {
          return desktop;
        } else if (constraints.maxWidth >= 768) {
          return tablet ?? desktop;
        }
        return mobile;
      },
    );
  }
}

// Usage
ResponsiveLayout(
  mobile: MobileLayout(),
  tablet: TabletLayout(),
  desktop: DesktopLayout(),
);
```

### Custom Scroll View

```dart
class CustomScrollViewExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 200,
          floating: false,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            title: const Text('Title'),
            background: Image.network(
              'https://example.com/image.jpg',
              fit: BoxFit.cover,
            ),
          ),
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) => ListTile(
              title: Text('Item $index'),
            ),
            childCount: 100,
          ),
        ),
        SliverGrid(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 1,
          ),
          delegate: SliverChildBuilderDelegate(
            (context, index) => Card(
              child: Center(child: Text('Grid $index')),
            ),
            childCount: 30,
          ),
        ),
      ],
    );
  }
}
```

---

## State Management

### BLoC Pattern

```dart
// Events
abstract class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested(this.email, this.password);
}
class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class Authenticated extends AuthState {
  final User user;
  Authenticated(this.user);
}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService authService;

  AuthBloc(this.authService) : super(AuthInitial()) {
    on<LoginRequested>(_onLogin);
    on<LogoutRequested>(_onLogout);
  }

  Future<void> _onLogin(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await authService.login(event.email, event.password);
      emit(Authenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLogout(LogoutRequested event, Emitter<AuthState> emit) async {
    await authService.logout();
    emit(AuthInitial());
  }
}
```

### Riverpod

```dart
// Provider definitions
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authProvider);
  return authState is Authenticated ? authState.user : null;
});

// StateNotifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService authService;

  AuthNotifier(this.authService) : super(AuthInitial()) {
    _init();
  }

  Future<void> _init() async {
    final user = await authService.getCurrentUser();
    if (user != null) {
      state = Authenticated(user);
    }
  }

  Future<void> login(String email, String password) async {
    state = AuthLoading();
    try {
      final user = await authService.login(email, password);
      state = Authenticated(user);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> logout() async {
    await authService.logout();
    state = AuthInitial();
  }
}

// Usage in widget
class ProfileScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    
    if (user == null) {
      return const LoginScreen();
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Center(child: Text('Hello, ${user.name}')),
    );
  }
}
```

---

## Animations

### Implicit Animations

```dart
class AnimatedContainerExample extends StatefulWidget {
  @override
  State<AnimatedContainerExample> createState() => _AnimatedContainerExampleState();
}

class _AnimatedContainerExampleState extends State<AnimatedContainerExample> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        width: _expanded ? 200 : 100,
        height: _expanded ? 200 : 100,
        decoration: BoxDecoration(
          color: _expanded ? Colors.blue : Colors.red,
          borderRadius: BorderRadius.circular(_expanded ? 20 : 10),
        ),
        child: const Center(
          child: Text('Tap me', style: TextStyle(color: Colors.white)),
        ),
      ),
    );
  }
}
```

### Explicit Animations

```dart
class PulseAnimation extends StatefulWidget {
  @override
  State<PulseAnimation> createState() => _PulseAnimationState();
}

class _PulseAnimationState extends State<PulseAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _animation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.scale(
          scale: _animation.value,
          child: child,
        );
      },
      child: const Icon(Icons.favorite, size: 50, color: Colors.red),
    );
  }
}
```

### Hero Animations

```dart
// Route A
class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ProductDetail(product: product)),
      ),
      child: Hero(
        tag: 'product-${product.id}',
        child: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(product.imageUrl),
        ),
      ),
    );
  }
}

// Route B
class ProductDetail extends StatelessWidget {
  final Product product;

  const ProductDetail({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Hero(
        tag: 'product-${product.id}',
        child: Image.network(product.imageUrl),
      ),
    );
  }
}
```

---

## Performance Optimization

### Image Caching

```dart
class CachedImage extends StatelessWidget {
  final String url;
  final double? width;
  final double? height;

  const CachedImage({
    super.key,
    required this.url,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: url,
      width: width,
      height: height,
      fit: BoxFit.cover,
      placeholder: (context, url) => const Center(
        child: CircularProgressIndicator(),
      ),
      errorWidget: (context, url, error) => const Icon(Icons.error),
      memCacheWidth: width?.toInt(),
      memCacheHeight: height?.toInt(),
    );
  }
}
```

### Lazy Loading

```dart
class LazyListView extends StatelessWidget {
  final List<String> items;

  const LazyListView({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, index) {
        return ListTile(
          title: Text(items[index]),
        );
      },
    );
  }
}
```

---

## Testing

### Unit Tests

```dart
void main() {
  group('AuthService', () {
    test('should login with valid credentials', () async {
      final service = AuthService();
      final user = await service.login('test@example.com', 'password');
      expect(user, isNotNull);
      expect(user.email, 'test@example.com');
    });

    test('should throw on invalid credentials', () async {
      final service = AuthService();
      expect(
        () => service.login('invalid@example.com', 'wrong'),
        throwsA(isA<AuthException>()),
      );
    });
  });
}
```

### Widget Tests

```dart
void main() {
  testWidgets('Counter increments', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    
    expect(find.text('0'), findsOneWidget);
    
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();
    
    expect(find.text('1'), findsOneWidget);
  });
}
```

---

## Quality Checklist

- [ ] Null safety enabled
- [ ] Responsive on all screen sizes
- [ ] Animations follow material design
- [ ] State management is consistent
- [ ] Platform channels used correctly
- [ ] Performance profiled
- [ ] Tests written (unit + widget)
- [ ] Accessibility labels added
- [ ] Error handling implemented
- [ ] App size optimized
