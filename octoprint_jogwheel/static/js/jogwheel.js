/*
 * View model for Jog Wheel Control
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function () {
    function JogwheelViewModel(parameters) {
        var self = this;

        self.printerProfilesViewModel = parameters[0];
        self.accessViewModel = parameters[1];

        self.jogHomeClick = function(data) {
            // exit out if user doesn't have control permissions
            if (!self.accessViewModel.loginState.hasPermissionKo(self.accessViewModel.permissions.CONTROL)) {
                return;
            }

            OctoPrint.control.sendGcode([data]);
        };

        self.jogAxesClick = function(data) {
            // exit out if user doesn't have control permissions
            if (!self.accessViewModel.loginState.hasPermissionKo(self.accessViewModel.permissions.CONTROL)) {
                return;
            }

            let direction = data.slice(0, 1);
            let distance = parseFloat(data.slice(1)) || 0;
            let speed = self.printerProfilesViewModel.currentProfileData().axes[direction.toLowerCase()].speed();

            if (self.printerProfilesViewModel.currentProfileData().axes[direction.toLowerCase()].inverted()) {
                let distance = distance * -1;
            }

            if (direction !== null && distance !== null && speed !== null) {
                let gcode_command = 'G1 ' + direction + distance + ' F' + speed;
                OctoPrint.control.sendGcode(['G91', gcode_command, 'G90']);
            }
        };

        self.onAllBound = function () {
            $('#control-jog-feedrate').appendTo('#jogWheelControl');
            $('#control-jog-flowrate').appendTo('#jogWheelControl');
            $('div.jog-panel:first').replaceWith($('#jogWheelControl'));
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: JogwheelViewModel,
        dependencies: ['printerProfilesViewModel', 'accessViewModel'],
        elements: ['#jogWheelControl']
    });
});
