<?php
require_once '../functions.php';
// dmidecode -t 17 (/dev/mem information)

class Memory {

	public $mem_total;

	public function __construct() {
		// $this->mem_total = $this->getTotal();
	}

  public function getTotal() {
    $cmd = 'sysctl -n hw.physmem';
    return Shell::exec($cmd);
  }

  public function getUsage() {
    $cmd = 'sysctl -n hw.usermem';
    return Shell::exec($cmd);
  }

}

?>