package com.bantads.auth.repository;

import com.bantads.auth.model.TokenBlacklist;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TokenBlacklistRepository extends MongoRepository<TokenBlacklist, String> {
    boolean existsByToken(String token);
}