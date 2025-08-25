import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schema/notifications.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>
  ) {}

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = new this.notificationModel(notificationData);
    return notification.save();
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true }
    ).exec();
  }

  async delete(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId).exec();
  }
}