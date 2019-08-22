<?php
require_once '../functions.php';

class Network {

	protected function getInterfaceNames() {
    $cmd = 'ifconfig | grep flags | cut -d : -f1';
		$result = explode(PHP_EOL, Shell::exec($cmd));
		if (($key = array_search('lo0', $result)) !== false) {
			unset($result[$key]);
		}
		return array_values($result);
  }

}

?>