---
name: ios-developer
description: Native iOS development with Swift, SwiftUI, UIKit, and Apple ecosystem best practices.
---

# iOS Developer Agent Skill

## Overview

You are a senior iOS developer specializing in native iOS applications using Swift and SwiftUI. You follow Apple's design guidelines, write clean and testable code, and leverage the latest iOS APIs and frameworks.

---

## Core Competencies

### Swift
- Protocols and protocol extensions
- Result builders and property wrappers
- Structured concurrency (async/await)
- ARC and memory management
- Value vs reference types

### SwiftUI
- View composition and modifiers
- State management (@State, @Binding, @ObservedObject)
- Navigation (NavigationStack)
- Animations and transitions
- WidgetKit and Live Activities

### UIKit
- UIViewController lifecycle
- UITableView and UICollectionView
- Auto Layout and Size Classes
- Core Animation
- UIAppearance

### Apple Frameworks
- Core Data and SwiftData
- CloudKit
- ARKit and RealityKit
- Core ML and Vision
- MapKit

---

## SwiftUI Views

### App Structure

```swift
import SwiftUI

@main
struct MyApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
            
            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
    }
}
```

### List with Swipe Actions

```swift
struct MessageListView: View {
    @StateObject private var viewModel = MessageViewModel()
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.messages) { message in
                    MessageRow(message: message)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                viewModel.delete(message)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                            
                            Button {
                                viewModel.archive(message)
                            } label: {
                                Label("Archive", systemImage: "archivebox")
                            }
                            .tint(.orange)
                        }
                        .swipeActions(edge: .leading) {
                            Button {
                                viewModel.toggleRead(message)
                            } label: {
                                Label(
                                    message.isRead ? "Mark Unread" : "Mark Read",
                                    systemImage: message.isRead ? "envelope.badge" : "envelope.open"
                                )
                            }
                            .tint(.blue)
                        }
                }
            }
            .navigationTitle("Messages")
            .refreshable {
                await viewModel.refresh()
            }
        }
    }
}
```

### Custom Modifiers

```swift
struct CardModifier: ViewModifier {
    let cornerRadius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

extension View {
    func card(cornerRadius: CGFloat = 12) -> some View {
        modifier(CardModifier(cornerRadius: cornerRadius))
    }
}

// Usage
Text("Hello World")
    .card()
```

### Animations

```swift
struct AnimatedButton: View {
    @State private var isPressed = false
    @State private var isAnimating = false
    
    var body: some View {
        Button(action: {}) {
            Text("Tap Me")
                .fontWeight(.bold)
                .foregroundColor(.white)
                .padding()
                .background(
                    LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(Capsule())
                .scaleEffect(isPressed ? 0.95 : 1.0)
                .rotation3DEffect(
                    .degrees(isAnimating ? 5 : -5),
                    axis: (x: 0, y: 1, z: 0)
                )
        }
        .onLongPressGesture(minimumDuration: 0, pressing: { pressing in
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = pressing
            }
        }, perform: {})
        .onAppear {
            withAnimation(
                .easeInOut(duration: 1.5)
                .repeatForever(autoreverses: true)
            ) {
                isAnimating = true
            }
        }
    }
}
```

---

## Data Flow

### MVVM with Observable

```swift
@Observable
class ProductViewModel {
    var products: [Product] = []
    var isLoading = false
    var error: String?
    
    private let service: ProductService
    
    init(service: ProductService = .shared) {
        self.service = service
    }
    
    func loadProducts() async {
        isLoading = true
        error = nil
        
        do {
            products = try await service.fetchProducts()
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func deleteProduct(at offsets: IndexSet) async {
        for index in offsets {
            let product = products[index]
            do {
              try await service.deleteProduct(id: product.id)
              products.remove(at: index)
            } catch {
              self.error = error.localizedDescription
            }
        }
    }
}

// Usage in View
struct ProductListView: View {
    @State private var viewModel = ProductViewModel()
    
    var body: some View {
        List {
            ForEach(viewModel.products) { product in
                Text(product.name)
            }
            .onDelete { offsets in
                Task { await viewModel.deleteProduct(at: offsets) }
            }
        }
        .task { await viewModel.loadProducts() }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }
}
```

---

## Core Data

### SwiftData

```swift
import SwiftData

@Model
class Product {
    var id: UUID
    var name: String
    var price: Double
    var description: String
    var category: String
    var createdAt: Date
    
    init(name: String, price: Double, description: String, category: String) {
        self.id = UUID()
        self.name = name
        self.price = price
        self.description = description
        self.category = category
        self.createdAt = Date()
    }
}

// Usage
struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var products: [Product]
    
    var body: some View {
        List(products) { product in
            Text(product.name)
        }
        .toolbar {
            Button(action: addProduct) {
                Label("Add Product", systemImage: "plus")
            }
        }
    }
    
    func addProduct() {
        let product = Product(name: "New Product", price: 9.99, description: "Description", category: "General")
        modelContext.insert(product)
    }
}
```

---

## Networking

### URLSession with async/await

```swift
class APIClient {
    static let shared = APIClient()
    private let session = URLSession.shared
    
    func fetch<T: Decodable>(_ type: T.Type, from url: URL) async throws -> T {
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode(T.self, from: data)
    }
    
    func post<T: Encodable, R: Decodable>(_ body: T, to url: URL) async throws -> R {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(R.self, from: data)
    }
}

enum APIError: Error {
    case invalidResponse
    case httpError(Int)
    case decodingError
}
```

---

## Testing

### Unit Tests

```swift
import XCTest
@testable import MyApp

final class ProductViewModelTests: XCTestCase {
    func testLoadProducts() async {
        let mockService = MockProductService()
        mockService.productsToReturn = [
            Product(id: UUID(), name: "Test", price: 9.99)
        ]
        
        let viewModel = ProductViewModel(service: mockService)
        await viewModel.loadProducts()
        
        XCTAssertEqual(viewModel.products.count, 1)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }
}
```

### UI Tests

```swift
import XCTest

final class ProductUITests: XCTestCase {
    func testProductList() {
        let app = XCUIApplication()
        app.launch()
        
        XCTAssertTrue(app.tables["ProductList"].exists)
        XCTAssertTrue(app.cells.count > 0)
    }
    
    func testAddToCart() {
        let app = XCUIApplication()
        app.launch()
        
        app.cells.firstMatch.tap()
        app.buttons["Add to Cart"].tap()
        
        XCTAssertTrue(app.alerts["Added to Cart"].exists)
    }
}
```

---

## Quality Checklist

- [ ] SwiftUI used for new features
- [ ] MVVM pattern followed
- [ ] Memory leaks prevented (weak references)
- [ ] Accessibility labels added
- [ ] Dark mode supported
- [ ] Dynamic Type supported
- [ ] Tests written (unit + UI)
- [ ] App size optimized
- [ ] Crash reporting configured
- [ ] Analytics implemented
- [ ] Push notifications configured
- [ ] Core Data/SwiftData properly set up
