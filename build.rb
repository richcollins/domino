#!/usr/bin/env ruby

require 'optparse'

class Importer
  attr_accessor :in_paths
  attr_accessor :yui_compressor_path
  attr_accessor :out_path
  
  attr_accessor :base_path
  attr_accessor :javascript_chunks
  
  @@shared = nil
  
  def self.shared
    if @@shared == nil
      @@shared = Importer.new
    end
    @@shared
  end
  
  def self.importPaths(paths)
    self.shared.import_paths(paths)
  end
  
  def initialize
    base_path = File.dirname(__FILE__)
    self.in_paths = [base_path + "/import.js"]
    self.yui_compressor_path = base_path + "/yuicompressor-2.4.7.jar"
    self.out_path = base_path + "/domino.js"
    self.javascript_chunks = []
  end
  
  def import_paths(paths)
    self.javascript_chunks += paths.map { |path| open("#{base_path}/#{path}.js").read }
  end
  
  def concat
    open(out_path, "w") do |f|
      f.write(javascript_chunks.join("\n"))
    end
  end
  
  def compress
    compressed_out_path = out_path.gsub(/\.js$/, '-compressed.js')
    cmd = "java -jar #{yui_compressor_path} #{out_path} -o #{compressed_out_path}"
    `#{cmd}`
  end
  
  def run
    in_paths.each do |in_path|
      self.base_path = File.dirname(in_path)
      self.send(:eval, open(in_path).read)
    end
    concat
    compress
  end
end

importer = Importer.shared

OptionParser.new do |opts|
  opts.on('-i', '--input-paths x,y,z', 'Input Paths') do |in_paths|
    importer.in_paths = in_paths.split(",")
  end

  opts.on('-y', '--yui-compressor-path PATH', 'YUI Compressor Path') do |path|
    importer.yui_compressor_path = path
  end

  opts.on('-o', '--out-path [PATH]', 'Output Path') do |out_path|
    importer.out_path = out_path
  end
end.parse!

importer.run