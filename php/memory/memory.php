<?php
require_once '../functions.php';

class Memory {

  protected function getTotal() {
    $cmd = 'sysctl -n hw.physmem';
    return Shell::exec($cmd);
  }

  protected function getUsage() {
    $cmd = 'sysctl -n hw.usermem';
    return Shell::exec($cmd);
  }

}

?>