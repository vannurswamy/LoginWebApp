package com.user.loginapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PhonePeService {

    @Value("${payment.phonepe.merchantId:YOUR_MERCHANT_ID}")
    private String merchantId;

    @Value("${payment.phonepe.merchantKey:YOUR_MERCHANT_SECRET_KEY}")
    private String merchantKey;

    @Value("${payment.phonepe.callbackUrl:http://localhost:8080/api/payments/phonepe/webhook}")
    private String callbackUrl;

    /**
     * Build a sample order payload for PhonePe integration.
     * In a production integration you would call PhonePe's create order API server-to-server
     * and return the payment token/URL to the client.
     */
    public Map<String, Object> buildOrder(String orderId, String amount, String customerName) {
        Map<String, Object> order = new HashMap<>();
        order.put("merchantId", merchantId);
        order.put("orderId", orderId);
        order.put("amount", amount); // amount in paise or specified units — follow PhonePe docs
        order.put("currency", "INR");
        order.put("customerName", customerName);
        order.put("callbackUrl", callbackUrl);

        String payload = String.format("%s|%s|%s", merchantId, orderId, amount);
        String signature = generateHmacSignature(payload, merchantKey);
        order.put("signature", signature);
        order.put("note", "This is a scaffolded order payload — replace with real PhonePe API call in production.");
        return order;
    }

    public boolean verifySignature(String payload, String signature) {
        String expected = generateHmacSignature(payload, merchantKey);
        return expected.equals(signature);
    }

    private String generateHmacSignature(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC signature", e);
        }
    }
}
