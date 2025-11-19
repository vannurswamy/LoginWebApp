package com.user.loginapp.controller;

import com.user.loginapp.dto.OrderItemRequest;
import com.user.loginapp.dto.OrderRequest;
import com.user.loginapp.entity.Order;
import com.user.loginapp.entity.OrderItem;
import com.user.loginapp.entity.Product;
import com.user.loginapp.repository.OrderRepository;
import com.user.loginapp.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) return ResponseEntity.badRequest().body("No items in order");
        Order order = new Order();
        order.setUsername(req.getUsername());
        order.setFullName(req.getFullName());
        order.setAddress(req.getAddress());
        order.setPhone(req.getPhone());
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest it : req.getItems()) {
            Product p = productRepository.findById(it.getProductId()).orElse(null);
            if (p == null) continue;
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProductId(p.getId());
            oi.setProductName(p.getTitle());
            oi.setQuantity(it.getQty());
            oi.setPrice(p.getPrice());
            items.add(oi);
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(it.getQty())));
        }
        order.setItems(items);
        order.setTotal(total);
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok().body(saved);
    }
}
