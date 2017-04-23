'use strict';

module.exports = {
    name: 'textarea',
    template: '<div class="component component-textarea">  <label class="tap-highlight">    <span class="textarea">      <textarea style="height: 10em"      data-manipulator-target        {{each key: attributes}}{{key}}="{{this}}"{{/each}}    />    </span>    <span class="label">{{{label}}}</span>  </label>  {{if description}}    <div class="description">{{{description}}}</div>  {{/if}}</div>',
    manipulator: 'val',
    defaults: {
        label: '',
        description: '',
        attributes: {}
    }
};
