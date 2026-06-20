---
name: android-developer
description: Native Android development with Kotlin, Jetpack Compose, Material Design, and modern Android architecture.
---

# Android Developer Agent Skill

## Overview

You are a senior Android developer specializing in native Android applications using Kotlin and Jetpack Compose. You follow Android architecture best practices, write clean and testable code, and leverage the latest Android APIs and libraries.

---

## Core Competencies

### Kotlin
- Coroutines and Flow
- Sequences and lazy collections
- DSL builders
- Extension functions
- Sealed classes and interfaces

### Jetpack Compose
- Composable functions
- State management (remember, mutableStateOf)
- Recomposition and stability
- CompositionLocal
- Side effects (LaunchedEffect, DisposableEffect)

### Android Architecture
- MVVM, MVI, UDF
- ViewModel and LiveData/StateFlow
- Repository pattern
- Dependency injection (Hilt/Koin)
- Navigation Compose

### Modern Android
- Material 3 Design
- Dynamic Color
- Edge-to-edge display
- Adaptive layouts
- WindowInsets

---

## Compose UI

### Material 3 Components

```kotlin
@Composable
fun ProductScreen(product: Product) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(product.name) },
                navigationIcon = {
                    IconButton(onClick = { /* back */ }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
        ) {
            item {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentScale = ContentScale.Crop,
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
            item {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.headlineMedium,
                )
            }
            item { Spacer(modifier = Modifier.height(8.dp)) }
            item {
                Text(
                    text = product.description,
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
            item {
                Button(
                    onClick = { /* add to cart */ },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Add to Cart")
                }
            }
        }
    }
}
```

### Form Validation

```kotlin
@Composable
fun RegistrationForm(onSubmit: (RegistrationData) -> Unit) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var nameError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        OutlinedTextField(
            value = name,
            onValueChange = {
                name = it
                nameError = if (it.isBlank()) "Name is required" else null
            },
            label = { Text("Name") },
            isError = nameError != null,
            supportingText = nameError?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth(),
        )

        OutlinedTextField(
            value = email,
            onValueChange = {
                email = it
                emailError = if (!it.contains("@")) "Invalid email" else null
            },
            label = { Text("Email") },
            isError = emailError != null,
            supportingText = emailError?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth(),
        )

        OutlinedTextField(
            value = password,
            onValueChange = {
                password = it
                passwordError = when {
                    it.length < 8 -> "Minimum 8 characters"
                    !it.any { c -> c.isUpperCase() } -> "Must contain uppercase"
                    else -> null
                }
            },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            isError = passwordError != null,
            supportingText = passwordError?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth(),
        )

        Button(
            onClick = { onSubmit(RegistrationData(name, email, password)) },
            modifier = Modifier.fillMaxWidth(),
            enabled = nameError == null && emailError == null && passwordError == null
                && name.isNotBlank() && email.isNotBlank() && password.isNotBlank(),
        ) {
            Text("Register")
        }
    }
}
```

### Navigation

```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    
    NavHost(navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onProductClick = { productId ->
                    navController.navigate("product/$productId")
                }
            )
        }
        composable(
            "product/{productId}",
            arguments = listOf(navArgument("productId") { type = NavType.StringType })
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            ProductScreen(
                productId = productId,
                onBack = { navController.popBackStack() }
            )
        }
        composable("cart") {
            CartScreen(
                onCheckout = { navController.navigate("checkout") }
            )
        }
        composable("checkout") {
            CheckoutScreen(
                onOrderComplete = {
                    navController.navigate("home") {
                        popUpTo("home") { inclusive = true }
                    }
                }
            )
        }
    }
}
```

---

## ViewModel

### MVI Pattern

```kotlin
// State
data class ProductListState(
    val products: List<Product> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)

// Intent
sealed class ProductListIntent {
    data object LoadProducts : ProductListIntent()
    data class Search(val query: String) : ProductListIntent()
    data class AddToCart(val productId: String) : ProductListIntent()
}

// ViewModel
@HiltViewModel
class ProductListViewModel @Inject constructor(
    private val productRepository: ProductRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ProductListState())
    val state: StateFlow<ProductListState> = _state.asStateFlow()

    init {
        handleIntent(ProductListIntent.LoadProducts)
    }

    fun handleIntent(intent: ProductListIntent) {
        when (intent) {
            is ProductListIntent.LoadProducts -> loadProducts()
            is ProductListIntent.Search -> searchProducts(intent.query)
            is ProductListIntent.AddToCart -> addToCart(intent.productId)
        }
    }

    private fun loadProducts() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            productRepository.getProducts()
                .onSuccess { products -> _state.update { it.copy(products = products, isLoading = false) } }
                .onFailure { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
        }
    }

    private fun searchProducts(query: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            productRepository.searchProducts(query)
                .onSuccess { products -> _state.update { it.copy(products = products, isLoading = false) } }
                .onFailure { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
        }
    }

    private fun addToCart(productId: String) {
        viewModelScope.launch {
            // Handle add to cart
        }
    }
}
```

---

## Dependency Injection

### Hilt Setup

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(context, AppDatabase::class.java, "app-db")
            .build()
    }

    @Provides
    fun provideProductDao(db: AppDatabase): ProductDao = db.productDao()
}

@HiltViewModel
class ProductViewModel @Inject constructor(
    private val productRepository: ProductRepository,
) : ViewModel() {
    // ViewModel implementation
}
```

---

## Testing

### Unit Tests

```kotlin
class ProductRepositoryTest {
    private val apiService = mockk<ApiService>()
    private val productDao = mockk<ProductDao>()
    private val repository = ProductRepository(apiService, productDao)

    @Test
    fun `getProducts returns cached data`() = runTest {
        val cachedProducts = listOf(Product("1", "Product 1", 10.0))
        every { productDao.getAll() } returns flowOf(cachedProducts)

        val result = repository.getProducts()

        assert(result.isSuccess)
        assertEquals(cachedProducts, result.getOrNull())
    }

    @Test
    fun `searchProducts filters correctly`() = runTest {
        val products = listOf(
            Product("1", "Laptop", 999.0),
            Product("2", "Phone", 699.0),
        )
        every { productDao.getAll() } returns flowOf(products)

        val result = repository.searchProducts("laptop")

        assert(result.isSuccess)
        assertEquals(1, result.getOrNull()?.size)
    }
}
```

### UI Tests

```kotlin
@Composable
fun ProductScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun productScreenDisplaysCorrectly() {
        val product = Product("1", "Test Product", 29.99, "Description")
        
        composeTestRule.setContent {
            ProductScreen(product = product)
        }

        composeTestRule.onNodeWithText("Test Product").assertIsDisplayed()
        composeTestRule.onNodeWithText("$29.99").assertIsDisplayed()
        composeTestRule.onNodeWithText("Add to Cart").assertIsDisplayed()
    }
}
```

---

## Quality Checklist

- [ ] Kotlin coroutines used properly
- [ ] ViewModel follows MVI pattern
- [ ] Compose recomposition optimized
- [ ] Navigation implemented correctly
- [ ] Dependency injection configured
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Accessibility labels added
- [ ] Unit and UI tests written
- [ ] Memory leaks prevented
- [ ] App follows Material Design
- [ ] ProGuard rules configured
