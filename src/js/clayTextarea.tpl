<div class="component component-textarea">
  <label class="tap-highlight">
    <span class="textarea" style="width: 100%">
      <textarea style="width: 100%; height: 50vh"
      data-manipulator-target
        {{each key: attributes}}{{key}}="{{this}}"{{/each}}
    />
    </span>
  </label>

  {{if description}}
    <div class="description">{{{description}}}</div>
  {{/if}}
</div>
