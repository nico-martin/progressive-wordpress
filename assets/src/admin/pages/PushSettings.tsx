import React from 'react';

import { __ } from '@wordpress/i18n';
import { useSettingsForm } from '../settings';
import { Form, FormContent, FormTableGroup } from '../theme';

const PushSettings = ({ settingsKeys }: { settingsKeys: string[] }) => {
  const { form, submit, error, loading } = useSettingsForm(settingsKeys);

  return (
    <Form onSubmit={submit}>
      <FormTableGroup
        title={__('Offline Usage', 'progressive-wp')}
        card
        canToggleKey="offline"
      >
        <FormContent>
          <p>
            <b>
              {__(
                'This feature allows you to provide offline usage for your website.',
                'progressive-wp'
              )}
            </b>
            <br />
            {__(
              'By default, a copy of each page is stored in the browser cache as the visitor views it. This allows a visitor to load any previously viewed page while they are offline. The plugin also defines a special “offline page”, which allows you to customize a message and the experience if the app is offline and the page is not in the cache. Additionally, you can define other pre-cached resources using the "offline content" feature',
              'progressive-wp'
            )}
          </p>
        </FormContent>
      </FormTableGroup>
    </Form>
  );
};

export default PushSettings;