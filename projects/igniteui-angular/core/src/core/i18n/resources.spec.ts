import { getCurrentResourceStrings, getI18nManager, IResourceStrings, registerI18n, setCurrentI18n } from 'igniteui-i18n-core';
import { ActionStripResourceStringsEN } from './action-strip-resources';
import { BannerResourceStringsEN } from './banner-resources';
import { changei18n, getCurrentResourceStrings as igxGetCurrentResourceStrings } from './resources';
import { ActionStripResourceStringsBG } from 'projects/igniteui-angular-i18n/src/i18n/BG/action-strip-resources';
import { BannerResourceStringsBG, ResourceStringsBG } from 'igniteui-i18n-resources';
import { IResourceCategories } from 'node_modules/igniteui-i18n-core/i18n-manager.interfaces';

import { describe, it, expect, beforeEach } from 'vitest';
describe('i18n', () => {
    beforeEach(() => {
        // Clear manager state between tests.
        (getI18nManager() as any)._resourcesMap = new Map<string, IResourceCategories>([
            [
                'en',
                {
                    default: 'US',
                    scripts: new Map<string, IResourceStrings>(),
                    regions: new Map<string, IResourceStrings>([['US', {}]]),
                },
            ],
        ]);
    });

    describe('old public API', () => {
        it('should correctly register old igx_ prefixed resources to new manager', () => {
            expect(getCurrentResourceStrings()).toEqual({});
            changei18n(ActionStripResourceStringsEN);

            expect(getCurrentResourceStrings()).toEqual({
                action_strip_button_more_title: 'More'
            });
        });

        it('should append new registered resources, if they have different keys', () => {
            changei18n(ActionStripResourceStringsEN);
            changei18n(BannerResourceStringsEN);

            expect(getCurrentResourceStrings()).toEqual({
                action_strip_button_more_title: 'More',
                banner_button_dismiss: 'Dismiss'
            });
        });

        it('should override old registered resources, if they have same keys', () => {
            changei18n(ActionStripResourceStringsEN);
            changei18n(BannerResourceStringsEN);
            changei18n(ActionStripResourceStringsBG);

            expect(getCurrentResourceStrings()).toEqual({
                action_strip_button_more_title: 'Още',
                banner_button_dismiss: 'Dismiss'
            });
        });
    });

    describe('internal API', () => {
        it('should correctly return component resources based on registered init resources', () => {
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, true);

            expect(igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false)).toEqual({
                igx_action_strip_button_more_title: 'More'
            });
        });

        it('should correctly filter out component resources based on registered init resources', () => {
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, true);
            igxGetCurrentResourceStrings(BannerResourceStringsEN, true);

            expect(getCurrentResourceStrings()).toEqual({
                action_strip_button_more_title: 'More',
                banner_button_dismiss: 'Dismiss'
            });
            expect(igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false)).toEqual({
                igx_action_strip_button_more_title: 'More'
            });
        });

        it('getting correctly filter out component resources should interfere with other calls for getting resources', () => {
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, true);
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false);
            igxGetCurrentResourceStrings(BannerResourceStringsEN, true);
            igxGetCurrentResourceStrings(BannerResourceStringsEN, false);
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false);

            expect(getCurrentResourceStrings()).toEqual({
                action_strip_button_more_title: 'More',
                banner_button_dismiss: 'Dismiss'
            });
            expect(igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false)).toEqual({
                igx_action_strip_button_more_title: 'More'
            });
        });
    });

    describe('new public API', () => {
        it('should return correct component resources when locale is changed using new API', () => {
            // Components init their default locales
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, true);
            igxGetCurrentResourceStrings(BannerResourceStringsEN, true);

            // User registers new locale
            registerI18n(ResourceStringsBG, 'bg');
            setCurrentI18n('bg');

            expect(igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false)).toEqual({
                igx_action_strip_button_more_title: 'Още'
            });

            setCurrentI18n('en-US');
        })

        it('should return default strings if locale is changed using new API, but its missing resources', () => {
            // Components init their default locales
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, true);
            igxGetCurrentResourceStrings(BannerResourceStringsEN, true);

            // User registers new locale
            setCurrentI18n('bg');

            expect(igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false)).toEqual({
                igx_action_strip_button_more_title: 'More'
            });

            setCurrentI18n('en-US');
        });

        it('should return default strings if locale is changed using new API, but its missing resources for this particular component', () => {
            // Components init their default locales
            igxGetCurrentResourceStrings(ActionStripResourceStringsEN, true);
            igxGetCurrentResourceStrings(BannerResourceStringsEN, true);

            // User registers new locale
            registerI18n(BannerResourceStringsBG, 'bg');
            setCurrentI18n('bg');

            expect(igxGetCurrentResourceStrings(ActionStripResourceStringsEN, false)).toEqual({
                igx_action_strip_button_more_title: 'More'
            });

            setCurrentI18n('en-US');
        });
    });
});
