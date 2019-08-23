<?php
require_once 'memory.php';

class MemoryUsage extends Memory {

	private $mem_usage;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getCurrentUsage(),
			'total' => $this->getTotal(),
			'usage' => $this->mem_usage
		));
	}

  private function getCurrentUsage() {
    $cmd = 'top -btIquz | tail +4 | head -2 | cut -d : -f2';
    $output = explode(', ', preg_replace("/\n\s/", ', ', Shell::exec($cmd)));
    $results = array();
    foreach($output as $key => $value) {
      $values = explode(' ', $value);
      if ($values[1] !== 'Total' && $values[1] !== 'Wired') {
        $results[$values[1]] = Convert::to_bytes($values[0]);
      }
		}
		$this->mem_usage = array_sum(array_values($results));
    return $results;
  }

}

$memory_usage = new MemoryUsage();

?>