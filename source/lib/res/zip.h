// Zip archiving on top of ZLib.
//
// Copyright (c) 2003 Jan Wassenberg
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation; either version 2 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.
//
// Contact info:
//   Jan.Wassenberg@stud.uni-karlsruhe.de
//   http://www.stud.uni-karlsruhe.de/~urkt/

#ifndef ZIP_H__
#define ZIP_H__

#include "h_mgr.h"
#include "file.h"	// FileCB for zip_enum


// note: filenames are case-insensitive.


//
// archive
//

// open and return a handle to the zip archive indicated by <fn>.
// somewhat slow - each file is added to an internal index.
extern Handle zip_archive_open(const char* fn);

// close the archive <ha> and set ha to 0
extern int zip_archive_close(Handle& ha);

// successively call <cb> for each valid file in the archive <ha>,
// passing the complete path and <user>.
// if it returns a nonzero value, abort and return that, otherwise 0.
extern int zip_enum(const Handle ha, const FileCB cb, const uintptr_t user);


//
// file
//

struct ZFile
{
#ifdef PARANOIA
	u32 magic;
#endif

	// keep offset of flags and size members in sync with struct File!
	// it is accessed by VFS and must be the same for both (union).
	// dirty, but necessary because VFile is pushing the HDATA size limit.
	uint flags;
	size_t ucsize;
		// size of logical file

	off_t ofs;	// in archive
	off_t csize;
	off_t last_read_ofs;	// in compressed file

	Handle ha;
	uintptr_t inf_ctx;
};

// get file status (currently only size). output param is zeroed on error.
extern int zip_stat(Handle ha, const char* fn, struct stat* s);

// open file, and fill *zf with information about it.
// return < 0 on error (output param zeroed). 
extern int zip_open(Handle ha, const char* fn, ZFile* zf);

// close file.
extern int zip_close(ZFile* zf);


//
// asynchronous read
//

//
// currently only supported for compressed files to keep things simple.
// see rationale in source.

// begin transferring <size> bytes, starting at <ofs>. get result
// with zip_wait_io; when no longer needed, free via zip_discard_io.
extern int zip_start_io(ZFile* const zf, off_t ofs, size_t size, void* buf, FileIO* io);

// indicates if the IO referenced by <io> has completed.
// return value: 0 if pending, 1 if complete, < 0 on error.
extern int zip_io_complete(FileIO io);

// wait until the transfer <io> completes, and return its buffer.
// output parameters are zeroed on error.
extern int zip_wait_io(FileIO io, void*& p, size_t& size);

// finished with transfer <io> - free its buffer (returned by zip_wait_io)
extern int zip_discard_io(FileIO io);


//
// synchronous read
//

// read from the (possibly compressed) file <zf> as if it were a normal file.
// starting at the beginning of the logical (decompressed) file,
// skip <ofs> bytes of data; read the next <size> bytes into <buf>.
//
// if non-NULL, <cb> is called for each block read, passing <ctx>.
// if it returns a negative error code,
// the read is aborted and that value is returned.
// the callback mechanism is useful for user progress notification or
// processing data while waiting for the next I/O to complete
// (quasi-parallel, without the complexity of threads).
//
// return bytes read, or a negative error code.
extern ssize_t zip_read(ZFile* zf, off_t ofs, size_t size, void* buf, FileIOCB cb = 0, uintptr_t ctx = 0);


//
// memory mapping
//

// useful for files that are too large to be loaded into memory,
// or if only (non-sequential) portions of a file are needed at a time.
//
// this is of course only possible for uncompressed files - compressed files
// would have to be inflated sequentially, which defeats the point of mapping.


// map the entire file <zf> into memory. mapping compressed files
// isn't allowed, since the compression algorithm is unspecified.
// output parameters are zeroed on failure.
//
// the mapping will be removed (if still open) when its archive is closed.
// however, map/unmap calls should still be paired so that the archive mapping
// may be removed when no longer needed.
extern int zip_map(ZFile* zf, void*& p, size_t& size);

// remove the mapping of file <zf>; fail if not mapped.
//
// the mapping will be removed (if still open) when its archive is closed.
// however, map/unmap calls should be paired so that the archive mapping
// may be removed when no longer needed.
extern int zip_unmap(ZFile* zf);


#endif	// #ifndef ZIP_H__
