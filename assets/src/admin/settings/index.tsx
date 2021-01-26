import React from 'react';
import { useForm } from 'react-hook-form';

import { VARS } from '../utils/constants';
import { ISetting, ISettings } from '../utils/types';
import {
  compareObjects,
  filterObject,
  keyValueFromSettings,
} from '../utils/objects';

const SettingsContext = React.createContext({
  settings: VARS.settings,
  savedSettings: VARS.settings,
  setSettings: (newSettingsValues: ISettings) => {},
  syncSettings: (keys: string[] = []) => new Promise((resolve, reject) => {}),
});

const postSettings = (data) =>
  new Promise((resolve, reject) => {
    fetch(`${VARS.restPluginBase}settings`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((resp) => Promise.all([resp, resp.json()]))
      .then(([resp, data]) => {
        if (resp.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message));
        }
      })
      .catch(() => {
        reject(new Error('<p>' + VARS.generalError + '</p>'));
      });
  });

export const SettingsProvider = ({ children }: { children?: any }) => {
  const [settings, setSettings] = React.useState<ISettings>(VARS.settings);
  const [savedSettings, setSavedSettings] = React.useState<ISettings>(
    VARS.settings
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        savedSettings,
        setSettings: (newSettingsValues: ISettings) => {
          const newSettings = {};
          Object.entries(newSettingsValues).map(([key, value]) => {
            newSettings[key] = {
              ...settings[key],
              value,
            };
          });
          setSettings({
            ...settings,
            ...newSettings,
          });
        },
        syncSettings: (keys: string[] = []) =>
          new Promise((resolve, reject) =>
            postSettings(keyValueFromSettings(filterObject(settings, keys)))
              .then((response: ISettings) => {
                resolve(response);
                setSavedSettings(response);
              })
              .catch((response) => {
                reject(response);
              })
          ),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsForm = (
  keys: string[] = []
): { form: any; submit: Function; error: string; loading: boolean } => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const {
    settings,
    savedSettings,
    setSettings = () => {},
    syncSettings = () => Promise.resolve(),
  } = React.useContext(SettingsContext);

  const filteredSettings = React.useMemo<ISettings>(
    () => filterObject<ISettings>(settings, keys),
    [settings, keys]
  );

  const defaultValues = React.useMemo(
    () => keyValueFromSettings(filteredSettings),
    [filteredSettings]
  );

  const form = useForm({
    defaultValues,
  });

  const values: Record<string, any> = form.watch(Object.keys(defaultValues));
  React.useEffect(() => {
    console.log('values', values);
    !compareObjects(keyValueFromSettings(filteredSettings), values) &&
      setSettings(values);
  }, [values]);

  const submit = form.handleSubmit((data) => {
    setLoading(true);
    setError('');
    syncSettings(keys)
      .then((data) => {
        setLoading(false);
      })
      .catch((data) => {
        setError(data.message);
        setLoading(false);
      });
  });

  const keyEvent = async (e: KeyboardEvent) => {
    if ((e.ctrlKey === true || e.metaKey === true) && e.key === 's') {
      e.preventDefault();
      await submit();
      return;
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', keyEvent, false);
    return () => {
      window.removeEventListener('keydown', keyEvent);
    };
  }, [settings, savedSettings]);

  return { form, submit, error, loading };
};

export const useSettingsDiff = (keys: string[] = []): boolean => {
  const { settings = {}, savedSettings = {} } = React.useContext(
    SettingsContext
  );

  return !compareObjects(
    filterObject(settings, keys),
    filterObject(savedSettings, keys)
  );
};

export const useSettings = (keys: string[] = []): ISettings => {
  const { savedSettings = {} } = React.useContext(SettingsContext);
  return filterObject<ISettings>(savedSettings, keys);
};

export const useTempSettings = (keys: string[] = []): ISettings => {
  const { settings = {} } = React.useContext(SettingsContext);
  return filterObject<ISettings>(settings, keys);
};