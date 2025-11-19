package com.user.loginapp.dto;

public class ProductDTO {
    private Long id;
    private String title;
    private String description;
    private Long price; // price in paise (integer) to match frontend expectations
    private String imageUrl;

    public ProductDTO() {}

    public ProductDTO(Long id, String title, String description, Long price, String imageUrl) {
        this.id = id; this.title = title; this.description = description; this.price = price; this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
