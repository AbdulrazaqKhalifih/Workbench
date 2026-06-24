package com.workbench.workbench.repository;

import com.workbench.workbench.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderBySentAtDesc(User user);
    List<Notification> findByUserAndReadAtIsNull(User user);
}