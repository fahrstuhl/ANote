<div class="component component-textarea">
  <label class="tap-highlight">
    <span class="label">{{{label}}}</span>
    <span class="textarea">
      <textarea
      data-manipulator-target
        {{each key: attributes}}{{key}}="{{this}}"{{/each}}
    />
    </span>
  </label>

  {{if description}}
    <div class="description">{{{description}}}</div>
  {{/if}}
</div>
