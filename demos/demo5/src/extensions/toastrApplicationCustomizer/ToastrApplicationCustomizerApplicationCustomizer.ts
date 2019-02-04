import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as strings from 'ToastrApplicationCustomizerApplicationCustomizerStrings';
import NotificationService from './services/NotificationService';
import { NotificationItem, SeverityType } from './models';

import * as $ from 'jquery';
import * as toastr from 'toastr';
import styles from './ToastrApplicationCustomizerApplicationCustomizer.module.scss';

const LOG_SOURCE: string = 'ToastrApplicationCustomizerApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IToastrApplicationCustomizerApplicationCustomizerProperties {
 
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ToastrApplicationCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<IToastrApplicationCustomizerApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    //Load the Toastr CSS
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css');

    //Go ahead and request the toasts, but we can't use them until jQuery and Toastr are ready
    NotificationService.getNotifications(this.context.pageContext.web.absoluteUrl, this.context.pageContext.web.id)
      .then((notifications: NotificationItem[]) => {
     
        toastr.options.positionClass = `${styles.topRight} ${styles.spfxToastr}`;
        toastr.options.preventDuplicates = true;
        toastr.options.newestOnTop = false; //Ensures the first toast we send is on top
        toastr.options.timeOut = 0; //Prevents auto dismissal
        toastr.options.extendedTimeOut = 0; //Prevents auto dismissal during hover
        toastr.options.tapToDismiss = true; //Allows messages to go away on click
        toastr.options.closeButton = true; //Shows a close button to let end users know to click to close

        toastr.options.titleClass = 'ms-font-m ms-fontWeight-semibold';
        toastr.options.messageClass = 'ms-font-s';
        toastr.options.iconClasses = {
          info: `${styles.info} ${styles.fabricIcon} ms-Icon--Info`,
          warning: `${styles.warning} ${styles.fabricIcon} ms-Icon--Warning`,
          error: `${styles.error} ${styles.fabricIcon} ms-Icon--Error`,
          success: `${styles.success} ${styles.fabricIcon} ms-Icon--Completed`
        };

        for (let t of notifications){
          //Setup callbacks to track dismisal status
          let overrides: ToastrOptions = {
            onclick: () => {
              NotificationService.ACKnowledgeNotification(t.Id, this.context.pageContext.web.id);
            },
            onCloseClick: () => {
              NotificationService.ACKnowledgeNotification(t.Id, this.context.pageContext.web.id);
            }
          };

          switch (t.Severity){
            case SeverityType.Warning:
              toastr.warning(t.Message, t.Title, overrides);
              break;
            case SeverityType.Error:
              toastr.error(t.Message, t.Title, overrides);
              break;
            case SeverityType.Success:
              toastr.success(t.Message, t.Title, overrides);
              break;
            default:
              toastr.info(t.Message, t.Title, overrides);
              break;
          }
        }
      }).catch((error: any): void => {
        //Generic error handler for any issues that occurred throughout
        // the promise chain. Display it in a toast!
        toastr.error(error, strings.FailedToLoad);
      });;

    return Promise.resolve();
  }
}
