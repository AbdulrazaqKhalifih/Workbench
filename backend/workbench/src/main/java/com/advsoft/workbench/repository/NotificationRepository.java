package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Notification;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderBySentAtDesc(User user);
    List<Notification> findByUserAndReadAtIsNull(User user);
}