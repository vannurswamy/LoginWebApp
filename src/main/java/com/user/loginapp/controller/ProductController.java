package com.user.loginapp.controller;

import com.user.loginapp.dto.ProductDTO;
import com.user.loginapp.entity.Product;
import com.user.loginapp.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDTO> all() {
        return productRepository.findAll().stream().map(p -> new ProductDTO(
                p.getId(), p.getTitle(), p.getDescription(), p.getPrice().multiply(java.math.BigDecimal.valueOf(100)).longValue(), p.getImageUrl()
        )).collect(Collectors.toList());
    }
}
