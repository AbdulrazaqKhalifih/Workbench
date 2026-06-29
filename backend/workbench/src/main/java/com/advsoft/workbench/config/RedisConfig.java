package com.advsoft.workbench.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

import java.time.Duration;
import java.util.Map;

@Configuration
@ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableCaching
public class RedisConfig {

    @Bean
    @Qualifier("redisJsonSerializer")
    public GenericJacksonJsonRedisSerializer redisJsonSerializer() {
        return GenericJacksonJsonRedisSerializer.builder()
                .enableDefaultTyping(BasicPolymorphicTypeValidator.builder()
                        .allowIfSubType("com.advsoft.workbench")
                        .allowIfSubType("java.lang")
                        .allowIfSubType("java.time")
                        .allowIfSubType("java.util")
                        .allowIfSubTypeIsArray()
                        .build())
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory,
            @Qualifier("redisJsonSerializer") GenericJacksonJsonRedisSerializer jsonSerializer) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * Dedicated template for rate-limiting counters (INCR/TTL-friendly).
     * Values are stored as plain strings so Redis INCR works reliably.
     */
    @Bean
    public RedisTemplate<String, String> rateLimitRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            @Qualifier("redisJsonSerializer") GenericJacksonJsonRedisSerializer jsonSerializer) {
        // Default config applied to all caches unless overridden below
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer));

        // Per-cache TTL overrides
        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                "users",    defaultConfig.entryTtl(Duration.ofMinutes(5)),
                "userRoles", defaultConfig.entryTtl(Duration.ofMinutes(5)),
                "teams", defaultConfig.entryTtl(Duration.ofMinutes(10)),
                "teamMembers", defaultConfig.entryTtl(Duration.ofMinutes(5)),
                "projects", defaultConfig.entryTtl(Duration.ofMinutes(10)),
                "tasks", defaultConfig.entryTtl(Duration.ofMinutes(3)),
                "notifications", defaultConfig.entryTtl(Duration.ofMinutes(1))
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
