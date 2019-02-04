import { SeverityType, FrequencyType } from ".";

export class NotificationItem {
    Id: number;
    Title: string;
    Message: string;
    Severity: SeverityType;
    Frequency: FrequencyType;
    Enabled:boolean;

    constructor(options: NotificationItem) {
        this.Id = options.Id;
        this.Title = options.Title;
        this.Message = options.Message;
        this.Severity = options.Severity;
        this.Frequency = options.Frequency;
        this.Enabled = options.Enabled;
    }
}