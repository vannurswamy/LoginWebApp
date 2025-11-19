package com.user.loginapp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCTS")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private BigDecimal price; // stored in currency units (e.g., 2499.00 means 2499.00)

    private String imageUrl;

    public Product() {}

    public Product(String title, String description, BigDecimal price, String imageUrl) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
