<?php
require_once '../functions.php';

class Cpu {

	public $core_count;

	public function __construct() {
		$this->$core_count = $this->getCores();
	}

	public function getCores() {
    $cmd = 'sysctl -n hw.ncpu';
    $result = intval(Shell::exec($cmd));
    return empty($result) ? 1 : $result;
	}

}

?>