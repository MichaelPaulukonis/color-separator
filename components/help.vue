<template>
  <div class="help-container">
    <h2>COLOR SEPARATOR HELP</h2>

    <h3>Keyboard Shortcuts</h3>
    <table>
      <tr>
        <th>Key</th>
        <th>Action</th>
      </tr>
      <tr>
        <td>r, g, b</td>
        <td>Extract RGB channels</td>
      </tr>
      <tr>
        <td>c, y, m, k</td>
        <td>Extract CMYK channels</td>
      </tr>
      <tr>
        <td>o</td>
        <td>Show original image</td>
      </tr>
      <tr>
        <td>d</td>
        <td>Apply dithering</td>
      </tr>
      <tr>
        <td>h</td>
        <td>Apply halftone effect</td>
      </tr>
      <tr>
        <td>p</td>
        <td>Apply photo dither effect</td>
      </tr>
      <tr>
        <td>a</td>
        <td>Extract single color</td>
      </tr>
      <tr>
        <td>e</td>
        <td>Extract target color</td>
      </tr>
      <tr>
        <td>s</td>
        <td>Save current image</td>
      </tr>
      <tr>
        <td>u</td>
        <td>Undo last operation</td>
      </tr>
      <tr>
        <td>g</td>
        <td>Open/close image gallery</td>
      </tr>
      <tr>
        <td>?</td>
        <td>Show this help</td>
      </tr>
    </table>

    <h3>Gallery Controls</h3>
    <ul>
      <li>Arrow keys - Navigate between images</li>
      <li>Single-click - Select image</li>
      <li>Double-click - Select and load image</li>
      <li>Enter/Return - Load selected image</li>
      <li>G key - Close gallery</li>
    </ul>

    <p>Drag and drop your own images onto the canvas to use them.</p>
  </div>
</template>

<style scoped>
.help-container {
  padding: 20px;
  max-width: 500px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

h3 {
  margin-top: 15px;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

ul {
  padding-left: 20px;
}

p {
  margin-top: 20px;
}
</style>
