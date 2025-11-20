package com.user.loginapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class PaymentController {

    @Value("${payment.merchant.upi:merchant@upi}")
    private String merchantUpi;

    // Create a UPI deep-link (client calls this and then opens the link on user's device)
    @PostMapping("/api/payments/upi/link")
    public ResponseEntity<Map<String, String>> createUpiLink(@RequestBody Map<String, Object> body) {
        String amount = String.valueOf(body.getOrDefault("amount", "0")); // amount in rupees (string like "249.00")
        String orderId = String.valueOf(body.getOrDefault("orderId", ""));
        String name = String.valueOf(body.getOrDefault("name", "Shaurya Store"));

        // Build a standard UPI deep link. PhonePe will respond to UPI intents if installed.
        // Merchant VPA comes from configuration (set payment.merchant.upi in application.properties)
        String tn = "Order%20" + orderId;
        String upiLink = String.format("upi://pay?pa=%s&pn=%s&am=%s&tn=%s&cu=INR", merchantUpi, name.replace(" ", "%20"), amount, tn);

        Map<String, String> resp = new HashMap<>();
        resp.put("upiLink", upiLink);
        resp.put("orderId", orderId);
        return ResponseEntity.ok(resp);
    }

    // For demo purposes: a simple verify endpoint that would check payment status with provider in real flow
    @PostMapping("/api/payments/upi/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> body) {
        String orderId = String.valueOf(body.getOrDefault("orderId", ""));
        Map<String, Object> resp = new HashMap<>();
        // In production, query PhonePe/payment gateway for the transaction status using their APIs.
        resp.put("orderId", orderId);
        resp.put("status", "SUCCESS");
        resp.put("message", "Simulated verification: payment marked as successful (demo)");
        return ResponseEntity.ok(resp);
    }
}
