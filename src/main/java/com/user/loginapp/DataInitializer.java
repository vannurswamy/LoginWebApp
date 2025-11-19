package com.user.loginapp;

import com.user.loginapp.entity.Product;
import com.user.loginapp.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataInitializer(ProductRepository productRepository) { this.productRepository = productRepository; }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) return;
        productRepository.save(new Product("Premium Rice 5kg", "Best quality basmati rice, fresh packed.", new BigDecimal("2499.00"), "https://picsum.photos/seed/rice/400/300"));
        productRepository.save(new Product("Cooking Oil 1L", "Healthy refined sunflower oil.", new BigDecimal("199.00"), "https://picsum.photos/seed/oil/400/300"));
        productRepository.save(new Product("Sugar 2kg", "Pure cane sugar.", new BigDecimal("119.00"), "https://picsum.photos/seed/sugar/400/300"));
        productRepository.save(new Product("Detergent Pack", "Cleans clothes bright and fresh.", new BigDecimal("349.00"), "https://picsum.photos/seed/detergent/400/300"));
        productRepository.save(new Product("Hand Sanitizer 500ml", "Kills 99.9% germs.", new BigDecimal("149.00"), "https://picsum.photos/seed/sanitizer/400/300"));
        productRepository.save(new Product("LED Bulb (Pack of 2)", "Energy efficient LED bulbs.", new BigDecimal("399.00"), "https://picsum.photos/seed/bulb/400/300"));
    }
}
