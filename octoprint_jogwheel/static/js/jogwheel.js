/*
 * View model for Jog Wheel Control
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function () {
    function JogwheelViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0];
        self.printerProfilesViewModel = parameters[1];
        self.accessViewModel = parameters[2];

        self.wheel1 = null;
        self.wheel10 = null;
        self.wheel100 = null;

        self.jogWheelClick = function (nav_wheel) {
            let distance = null;
            let direction = null;
            let speed = null;

            if (!self.accessViewModel.loginState.hasPermissionKo(self.accessViewModel.permissions.CONTROL)) {
                return;
            }

            nav_wheel.navItems[nav_wheel.currentClick].selected = false;
            nav_wheel.refreshWheel();

            switch (nav_wheel.holderId) {
                case 'wheel1':
                    distance = 1;
                    break;
                case 'wheel10':
                    distance = 10;
                    break;
                case 'wheel100':
                    distance = 100;
                    break;
                case 'jog_z':
                    direction = 'Z';
                    switch (nav_wheel.currentClick) {
                        case 0:
                            distance = 10;
                            break;
                        case 1:
                            distance = 1;
                            break;
                        case 2:
                            distance = 0.1;
                            break;
                        case 3:
                            OctoPrint.control.sendGcode('G28 Z');
                            return;
                        case 4:
                            distance = -0.1;
                            break;
                        case 5:
                            distance = -1;
                            break;
                        case 6:
                            distance = -10;
                            break;
                        default:
                            console.log('direction not determined');
                    }

                    if (self.printerProfilesViewModel.currentProfileData().axes.z.inverted()) {
                        distance = distance * -1;
                    }

                    speed = self.printerProfilesViewModel.currentProfileData().axes.z.speed();
                    break;
                default:
                    console.log('undetermined navwheel clicked');
            }

            if (nav_wheel.holderId !== 'jog_z') {
                switch (nav_wheel.currentClick) {
                    case 0:
                        direction = 'X';
                        if (self.printerProfilesViewModel.currentProfileData().axes.x.inverted()) {
                            distance = distance * -1;
                        }
                        speed = self.printerProfilesViewModel.currentProfileData().axes.x.speed();
                        break;
                    case 1:
                        direction = 'Y';
                        distance = distance * -1;
                        if (self.printerProfilesViewModel.currentProfileData().axes.y.inverted()) {
                            distance = distance * -1;
                        }
                        speed = self.printerProfilesViewModel.currentProfileData().axes.y.speed();
                        break;
                    case 2:
                        direction = 'X';
                        distance = distance * -1;
                        if (self.printerProfilesViewModel.currentProfileData().axes.x.inverted()) {
                            distance = distance * -1;
                        }
                        speed = self.printerProfilesViewModel.currentProfileData().axes.x.speed();
                        break;
                    case 3:
                        direction = 'Y';
                        if (self.printerProfilesViewModel.currentProfileData().axes.y.inverted()) {
                            distance = distance * -1;
                        }
                        speed = self.printerProfilesViewModel.currentProfileData().axes.y.speed();
                        break;
                    default:
                        console.log('direction not determined');
                }
            }

            if (direction !== null && distance !== null && speed !== null) {
                let gcode_command = 'G1 ' + direction + distance + ' F' + speed;
                OctoPrint.control.sendGcode(['G91', gcode_command, 'G90']);
            }
        };

        self.onTabChange = function (next, current) {
            if (next === '#control') {
                self.wheel1.refreshWheel(true);
                self.wheel10.refreshWheel(true);
                self.wheel100.refreshWheel(true);
                self.jog_z.refreshWheel(true);
                console.log(self.wheel1);
                console.log(self.wheel10);
            }
        };

        self.onAllBound = function () {
            let primary_color = self.settingsViewModel.settings.plugins.jogwheel.primary_color();
            let stroke_color = self.settingsViewModel.settings.plugins.jogwheel.stroke_color();
            let text_color = self.settingsViewModel.settings.plugins.jogwheel.text_color();

            let title_font = {
                cursor: 'pointer',
                fill: text_color,
                font: '100 18px Impact, Charcoal, sans-serif',
                stroke: 'none'
            };

            let title_font_hover = {
                cursor: 'pointer',
                fill: text_color,
                font: '100 24px Impact, Charcoal, sans-serif',
                stroke: 'none'
            };

            // Use advanced constructor for more wheelnav on same div
            self.wheel1 = new wheelnav('wheel1', null, 200, 200);
            self.wheel10 = new wheelnav('wheel10', self.wheel1.raphael);
            self.wheel100 = new wheelnav('wheel100', self.wheel1.raphael);
            self.jog_z = new wheelnav('jog_z', null, 50, 200);

            // XY Home Button
            self.wheel1.spreaderEnable = true;
            self.wheel1.spreaderPathInAttr = {fill: stroke_color, 'stroke-width': 3, stroke: stroke_color};
            self.wheel1.spreaderPathOutAttr = {fill: stroke_color, 'stroke-width': 3, stroke: stroke_color};
            self.wheel1.spreaderTitleInAttr = {fill: text_color};
            self.wheel1.spreaderTitleOutAttr = {fill: text_color};
            self.wheel1.spreaderRadius = 25;
            self.wheel1.spreaderInPercent = 1;
            self.wheel1.spreaderOutPercent = 1;
            self.wheel1.spreaderInTitle = icon.home;
            self.wheel1.spreaderOutTitle = icon.home;
            self.wheel1.spreaderOutTitleHeight = 25;
            self.wheel1.spreaderInTitleHeight = 25;
            self.wheel1.spreadWheel = function () {
                if (self.accessViewModel.loginState.hasPermissionKo(self.accessViewModel.permissions.CONTROL)) {
                    OctoPrint.control.sendGcode('G28 X Y');
                }
            };

            // XY jog wheels
            self.wheel1.slicePathFunction = slicePath().DonutSlice;
            self.wheel1.slicePathCustom = slicePath().DonutSliceCustomization();
            self.wheel1.slicePathCustom.minRadiusPercent = 0.25;
            self.wheel1.slicePathCustom.maxRadiusPercent = 0.5;
            self.wheel1.sliceSelectedPathCustom = self.wheel1.slicePathCustom;
            self.wheel1.sliceInitPathCustom = self.wheel1.slicePathCustom;
            self.wheel1.titleAttr = title_font;
            self.wheel1.titleHoverAttr = title_font_hover;

            self.wheel10.slicePathFunction = slicePath().DonutSlice;
            self.wheel10.slicePathCustom = slicePath().DonutSliceCustomization();
            self.wheel10.slicePathCustom.minRadiusPercent = 0.5;
            self.wheel10.slicePathCustom.maxRadiusPercent = 0.75;
            self.wheel10.sliceSelectedPathCustom = self.wheel10.slicePathCustom;
            self.wheel10.sliceInitPathCustom = self.wheel10.slicePathCustom;
            self.wheel10.titleAttr = title_font;
            self.wheel10.titleHoverAttr = title_font_hover;

            self.wheel100.slicePathFunction = slicePath().DonutSlice;
            self.wheel100.slicePathCustom = slicePath().DonutSliceCustomization();
            self.wheel100.slicePathCustom.minRadiusPercent = 0.75;
            self.wheel100.slicePathCustom.maxRadiusPercent = 1;
            self.wheel100.sliceSelectedPathCustom = self.wheel100.slicePathCustom;
            self.wheel100.sliceInitPathCustom = self.wheel100.slicePathCustom;
            self.wheel100.titleAttr = title_font;
            self.wheel100.titleHoverAttr = title_font_hover;

            // Z jog control
            self.jog_z.slicePathFunction = slicePath().TabSlice;
            self.jog_z.wheelRadius = 200 * 0.9;
            self.jog_z.centerY = 100;
            self.jog_z.titleAttr = title_font;
            self.jog_z.titleHoverAttr = title_font_hover;

            // Disable rotation, deselect, set animatetime and create the menus
            self.wheel1.clickModeRotate = false;
            self.wheel10.clickModeRotate = false;
            self.wheel100.clickModeRotate = false;
            self.jog_z.clickModeRotate = false;

            self.wheel1.selectedNavItemIndex = null;
            self.wheel10.selectedNavItemIndex = null;
            self.wheel100.selectedNavItemIndex = null;
            self.jog_z.selectedNavItemIndex = null;

            self.wheel1.animatetime = 0;
            self.wheel10.animatetime = 0;
            self.wheel100.animatetime = 0;
            self.jog_z.animatetime = 0;

            self.wheel1.colors = [primary_color];
            self.wheel10.colors = [primary_color];
            self.wheel100.colors = [primary_color];
            self.jog_z.colors = [primary_color];

            self.wheel1.slicePathAttr = {
                'fill': primary_color,
                'fill-opacity': 1,
                'stroke': stroke_color,
                'stroke-width': 3
            };
            self.wheel10.slicePathAttr = {
                'fill': primary_color,
                'fill-opacity': 1,
                'stroke': stroke_color,
                'stroke-width': 3
            };
            self.wheel100.slicePathAttr = {
                'fill': primary_color,
                'fill-opacity': 1,
                'stroke': stroke_color,
                'stroke-width': 3
            };
            self.jog_z.slicePathAttr = {
                'fill': primary_color,
                'fill-opacity': 1,
                'stroke': stroke_color,
                'stroke-width': 3
            };

            self.wheel1.animateFinishFunction = function () {
                self.jogWheelClick(self.wheel1);
            };
            self.wheel10.animateFinishFunction = function () {
                self.jogWheelClick(self.wheel10);
            };
            self.wheel100.animateFinishFunction = function () {
                self.jogWheelClick(self.wheel100);
            };
            self.jog_z.animateFinishFunction = function () {
                self.jogWheelClick(self.jog_z);
            };

            // replace default controls
            $('#control-jog-xy').replaceWith($('#jogwheel-control-jog-xy'));
            $('#control-jog-z').replaceWith($('#jogwheel-control-jog-z'));
            // $('#control-jog-feedrate').appendTo('#control-jog-xy');
            $('.distance > .btn-group, #control-jog-z > h1').remove();

            self.wheel1.createWheel(['', '', '', '1']);
            self.wheel10.createWheel(['', '', '', '10']);
            self.wheel100.createWheel(['', '', '', '100']);
            self.jog_z.createWheel(['10', '1', '0.1', icon.home, '0.1', '1', '10']);
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: JogwheelViewModel,
        dependencies: ['settingsViewModel', 'printerProfilesViewModel', 'accessViewModel'],
        elements: ['#jogwheel-control-jog-xy', '#jogwheel-control-jog-z', '#settings_plugin_jogwheel']
    });
});
