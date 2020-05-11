import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ToolbarButton } from '../ToolbarButton';
import store from '../../store';
import { IBrowserAction } from '~/common/extensions/interfaces/browser-action';

interface Props {
  data: IBrowserAction;
}

// TODO: sandbox

const showPopup = (
  data: IBrowserAction,
  left: number,
  top: number,
  inspect: boolean,
) => {
  store.extensions.currentlyToggledPopup = data.extensionId;
  browser.browserAction.showPopup(data.extensionId, { left, top, inspect });
};

let canOpenPopup = true;

const onClick = (data: IBrowserAction) => (
  e: React.MouseEvent<HTMLDivElement>,
) => {
  if (data.tabId) {
    // TODO:
    //extensionsRenderer.browserAction.onClicked(data.extensionId, data.tabId);
  }

  if (canOpenPopup) {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showPopup(data, right, bottom, false);
  }
};

const onContextMenu = (data: IBrowserAction) => (
  e: React.MouseEvent<HTMLDivElement>,
) => {
  const { target } = e;
  const menu = remote.Menu.buildFromTemplate([
    {
      label: 'Inspect popup',
      click: () => {
        const { right, bottom } = (target as any).getBoundingClientRect();
        showPopup(data, right, bottom, true);
      },
    },
    {
      label: 'Inspect background page',
      click: () => {
        // ipcRenderer.invoke(
        //   `inspect-extension`,
        //   store.isIncognito,
        //   data.extensionId,
        // );
      },
    },
  ]);

  menu.popup();
};

const onMouseDown = (data: IBrowserAction) => async (e: any) => {
  canOpenPopup =
    !store.dialogsVisibility['extension-popup'] ||
    data.extensionId !== store.extensions.currentlyToggledPopup;
  // ipcRenderer.send(`hide-extension-popup-${store.windowId}`);
};

export const BrowserAction = observer(({ data }: Props) => {
  const {
    icon,
    badgeText,
    badgeBackgroundColor,
    badgeTextColor,
    extensionId,
  } = data;

  return (
    <ToolbarButton
      onClick={onClick(data)}
      onMouseDown={onMouseDown(data)}
      onContextMenu={onContextMenu(data)}
      opacity={1}
      autoInvert={false}
      size={16}
      toggled={
        store.dialogsVisibility['extension-popup'] &&
        store.extensions.currentlyToggledPopup === extensionId
      }
      icon={icon}
      badge={badgeText.trim() !== ''}
      badgeBackground={badgeBackgroundColor}
      badgeTextColor={badgeTextColor}
      badgeText={badgeText}
    ></ToolbarButton>
  );
});
