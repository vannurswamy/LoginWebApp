package com.user.loginapp.dto;

import java.util.List;

public class OrderRequest {
    private String username;
    private String fullName;
    private String address;
    private String phone;
    private List<OrderItemRequest> items;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public java.util.List<OrderItemRequest> getItems() { return items; }
    public void setItems(java.util.List<OrderItemRequest> items) { this.items = items; }
}
